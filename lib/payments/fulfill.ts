import { supabase } from "@/lib/supabase";
import { verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave-server";
import * as storage from "@/lib/storage";

type FulfillResult =
  | { ok: true; alreadyProcessed: boolean; order: any }
  | { ok: false; reason: string };

export async function fulfillFlutterwavePayment(
  transactionId: string
): Promise<FulfillResult> {
  let verified;
  try {
    verified = await verifyFlutterwaveTransaction(transactionId);
  } catch (err: any) {
    return { ok: false, reason: err.message || "Verification with Flutterwave failed." };
  }

  if (verified.status !== "successful") {
    return { ok: false, reason: `Transaction status was "${verified.status}", not successful.` };
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("tx_ref", verified.tx_ref)
    .single();

  if (paymentError || !payment) {
    return { ok: false, reason: "No matching payment record found for this tx_ref." };
  }

  if (Number(verified.amount) < Number(payment.amount) || verified.currency !== payment.currency) {
    return { ok: false, reason: "Verified amount/currency does not match the initiated payment." };
  }

  if (!payment.order_id) {
    return { ok: false, reason: "No order associated with this payment." };
  }

  // Idempotency: already marked success on a prior call (callback + webhook race).
  if (payment.status === "success") {
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("id", payment.order_id)
      .single();
    return { ok: true, alreadyProcessed: true, order: existingOrder };
  }

  const order = await storage.markOrderPaid(payment.order_id, String(verified.id));

  await supabase
    .from("payments")
    .update({
      status: "success",
      flw_transaction_id: String(verified.id),
      verified_at: new Date().toISOString(),
    })
    .eq("tx_ref", verified.tx_ref);

  return { ok: true, alreadyProcessed: false, order };
}