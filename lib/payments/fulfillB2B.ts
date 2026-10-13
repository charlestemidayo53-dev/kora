// lib/payments/fulfillB2B.ts
// SERVER ONLY. Confirms a B2B milestone only after Flutterwave confirms the transaction.
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave-server";

type FulfillB2BOptions = {
  // When set (browser callback path), the milestone must belong to this signed-in buyer.
  expectedBuyerEmail?: string;
};

type FulfillB2BResult =
  | { ok: true; alreadyProcessed: boolean; milestone: any }
  | { ok: false; reason: string; retryable?: boolean };

async function recomputeOrderPaymentStatus(admin: ReturnType<typeof getSupabaseAdmin>, orderId: string) {
  const { data: order } = await admin.from("b2b_orders").select("total_amount").eq("id", orderId).maybeSingle();
  if (!order) return;

  const { data: milestones } = await admin
    .from("b2b_payment_milestones")
    .select("amount, status")
    .eq("b2b_order_id", orderId);

  const confirmedTotal = (milestones || [])
    .filter((m: any) => m.status === "confirmed")
    .reduce((sum: number, m: any) => sum + Number(m.amount), 0);

  let paymentStatus: "unpaid" | "partially_paid" | "paid" = "unpaid";
  if (confirmedTotal >= Number(order.total_amount)) paymentStatus = "paid";
  else if (confirmedTotal > 0) paymentStatus = "partially_paid";

  const { error } = await admin.from("b2b_orders").update({ payment_status: paymentStatus }).eq("id", orderId);
  if (error) console.error("fulfillB2B: recompute failed:", error.message);
}

export async function fulfillB2BPayment(
  transactionId: string,
  options: FulfillB2BOptions = {}
): Promise<FulfillB2BResult> {
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
  if (!String(verified.tx_ref || "").startsWith("korab2b_")) {
    return { ok: false, reason: "This transaction is not a B2B payment." };
  }

  const { data: milestone, error: milestoneError } = await admin
    .from("b2b_payment_milestones")
    .select("*")
    .eq("tx_ref", verified.tx_ref)
    .maybeSingle();

  if (milestoneError) {
    console.error("fulfillB2B: milestone lookup failed:", milestoneError.message);
    return { ok: false, reason: "Could not load the payment record.", retryable: true };
  }
  if (!milestone) {
    return { ok: false, reason: "No matching B2B milestone found for this transaction." };
  }

  const { data: order, error: orderError } = await admin
    .from("b2b_orders")
    .select("id, buyer_email")
    .eq("id", milestone.b2b_order_id)
    .maybeSingle();
  if (orderError) {
    return { ok: false, reason: "Could not load the order.", retryable: true };
  }
  if (!order) {
    return { ok: false, reason: "The order for this payment was not found." };
  }

  if (
    options.expectedBuyerEmail &&
    String(order.buyer_email || "").toLowerCase() !== options.expectedBuyerEmail.toLowerCase()
  ) {
    return { ok: false, reason: "This payment does not belong to your account." };
  }

  if (Number(verified.amount) < Number(milestone.amount) || verified.currency !== "NGN") {
    return { ok: false, reason: "Verified amount or currency does not match the milestone." };
  }

  if (milestone.status === "confirmed") {
    await recomputeOrderPaymentStatus(admin, milestone.b2b_order_id);
    return { ok: true, alreadyProcessed: true, milestone };
  }

  const { data: updated, error: updateError } = await admin
    .from("b2b_payment_milestones")
    .update({
      status: "confirmed",
      flw_transaction_id: String(verified.id),
      confirmed_by: "Flutterwave (auto-verified)",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", milestone.id)
    .neq("status", "confirmed")
    .select()
    .maybeSingle();

  if (updateError) {
    console.error("fulfillB2B: milestone update failed:", updateError.message);
    return { ok: false, reason: "Could not record the payment.", retryable: true };
  }

  if (!updated) {
    // Another call confirmed it first (callback + webhook race).
    await recomputeOrderPaymentStatus(admin, milestone.b2b_order_id);
    return { ok: true, alreadyProcessed: true, milestone };
  }

  await recomputeOrderPaymentStatus(admin, milestone.b2b_order_id);
  return { ok: true, alreadyProcessed: false, milestone: updated };
}
