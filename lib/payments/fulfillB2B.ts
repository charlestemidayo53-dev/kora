import { supabase } from "@/lib/supabase";
import { verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave-server";
import { recomputeB2BOrderPaymentStatus } from "@/lib/b2b";

type FulfillB2BResult =
  | { ok: true; alreadyProcessed: boolean; milestone: any }
  | { ok: false; reason: string };

export async function fulfillB2BPayment(transactionId: string): Promise<FulfillB2BResult> {
  let verified;
  try {
    verified = await verifyFlutterwaveTransaction(transactionId);
  } catch (err: any) {
    return { ok: false, reason: err.message || "Verification with Flutterwave failed." };
  }

  if (verified.status !== "successful") {
    return { ok: false, reason: `Transaction status was "${verified.status}", not successful.` };
  }

  const { data: milestone, error: milestoneError } = await supabase
    .from("b2b_payment_milestones")
    .select("*")
    .eq("tx_ref", verified.tx_ref)
    .single();

  if (milestoneError || !milestone) {
    return { ok: false, reason: "No matching B2B milestone found for this tx_ref." };
  }

  if (Number(verified.amount) < Number(milestone.amount)) {
    return { ok: false, reason: "Verified amount does not match the milestone amount." };
  }

  if (milestone.status === "confirmed") {
    return { ok: true, alreadyProcessed: true, milestone };
  }

  const { data: updated, error: updateError } = await supabase
    .from("b2b_payment_milestones")
    .update({
      status: "confirmed",
      flw_transaction_id: String(verified.id),
      confirmed_by: "Flutterwave (auto-verified)",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", milestone.id)
    .select()
    .single();

  if (updateError) throw updateError;

  await recomputeB2BOrderPaymentStatus(milestone.b2b_order_id);

  return { ok: true, alreadyProcessed: false, milestone: updated };
}
