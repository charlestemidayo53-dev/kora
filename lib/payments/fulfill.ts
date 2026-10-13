// lib/payments/fulfill.ts
// SERVER ONLY. Marks an order paid only after Flutterwave confirms the transaction.
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave-server";

type FulfillOptions = {
  // When set (browser callback path), the payment must belong to this signed-in buyer.
  expectedBuyerEmail?: string;
};

type FulfillResult =
  | { ok: true; alreadyProcessed: boolean; order: any }
  | { ok: false; reason: string; retryable?: boolean };

export async function fulfillFlutterwavePayment(
  transactionId: string,
  options: FulfillOptions = {}
): Promise<FulfillResult> {
  const admin = getSupabaseAdmin();

  let verified;
  try {
    verified = await verifyFlutterwaveTransaction(transactionId);
  } catch (err: any) {
    return { ok: false, reason: err?.message || "Verification with Flutterwave failed.", retryable: true };
  }

  if (verified.status !== "successful") {
    return { ok: false, reason: `Transaction status was "${verified.status}", not successful.` };
  }

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("*")
    .eq("tx_ref", verified.tx_ref)
    .maybeSingle();

  if (paymentError) {
    console.error("fulfill: payment lookup failed:", paymentError.message);
    return { ok: false, reason: "Could not load the payment record.", retryable: true };
  }
  if (!payment) {
    return { ok: false, reason: "No matching payment record found for this transaction." };
  }

  if (
    options.expectedBuyerEmail &&
    String(payment.buyer_email || "").toLowerCase() !== options.expectedBuyerEmail.toLowerCase()
  ) {
    return { ok: false, reason: "This payment does not belong to your account." };
  }

  if (Number(verified.amount) < Number(payment.amount) || verified.currency !== payment.currency) {
    return { ok: false, reason: "Verified amount or currency does not match the initiated payment." };
  }

  if (!payment.order_id) {
    return { ok: false, reason: "No order associated with this payment." };
  }

  // Only update an order that is not already paid, so repeated calls (callback + webhook) cannot double-process.
  // Orders with a NULL payment_status are included.
  const { data: updatedOrder, error: orderError } = await admin
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      flw_transaction_id: String(verified.id),
      escrow_status: "holding",
    })
    .eq("id", payment.order_id)
    .or("payment_status.is.null,payment_status.neq.paid")
    .select()
    .maybeSingle();

  if (orderError) {
    console.error("fulfill: order update failed:", orderError.message);
    return { ok: false, reason: "Could not update the order.", retryable: true };
  }

  let order = updatedOrder;
  let alreadyProcessed = false;

  if (!order) {
    const { data: existing, error: existingError } = await admin
      .from("orders")
      .select("*")
      .eq("id", payment.order_id)
      .maybeSingle();

    if (existingError) {
      return { ok: false, reason: "Could not load the order.", retryable: true };
    }
    if (!existing) {
      return { ok: false, reason: "The order for this payment was not found." };
    }
    if (existing.payment_status !== "paid") {
      return { ok: false, reason: "The order could not be updated.", retryable: true };
    }
    order = existing;
    alreadyProcessed = true;
  }

  if (payment.status !== "success") {
    const { error: paymentUpdateError } = await admin
      .from("payments")
      .update({
        status: "success",
        flw_transaction_id: String(verified.id),
        verified_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      console.error("fulfill: payment update failed:", paymentUpdateError.message);
      return { ok: false, reason: "Could not record the payment.", retryable: true };
    }
  }

  return { ok: true, alreadyProcessed, order };
}
