// lib/payments/fulfill.ts
//
// Server-only. Verifies a Flutterwave transaction against our own
// `payments` record and, only on a genuine match, creates the paid order.
// Safe to call more than once for the same transaction_id — the checkout
// callback (app/api/payments/verify/route.ts) and, later, the webhook
// (app/api/payments/webhook/route.ts) both funnel through here, and the
// second call is a no-op rather than a duplicate order.

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

  // Guard against tampering — the only amount/currency we trust are the
  // ones we generated ourselves at initiate time, not anything the client
  // or the redirect URL could have influenced.
  if (Number(verified.amount) < Number(payment.amount) || verified.currency !== payment.currency) {
    return { ok: false, reason: "Verified amount/currency does not match the initiated payment." };
  }

  // Idempotency: if this payment was already fulfilled (e.g. the client
  // callback already ran, and now the webhook fired for the same
  // transaction), return the existing order instead of creating a
  // duplicate.
  if (payment.status === "success" && payment.order_id) {
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("id", payment.order_id)
      .single();
    return { ok: true, alreadyProcessed: true, order: existingOrder };
  }

  const order = await storage.createPaidOrder({
    productId: payment.product_id,
    productName: payment.product_name,
    buyer: payment.buyer_email,
    seller: payment.seller,
    amount: payment.amount,
    txRef: payment.tx_ref,
    flwTransactionId: String(verified.id),
  });

  await supabase
    .from("payments")
    .update({
      status: "success",
      flw_transaction_id: String(verified.id),
      order_id: order.id,
      verified_at: new Date().toISOString(),
    })
    .eq("tx_ref", verified.tx_ref);

  return { ok: true, alreadyProcessed: false, order };
}