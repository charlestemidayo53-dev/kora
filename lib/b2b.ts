import { supabase } from "./supabase";

function fail(error: { message?: string } | null, fallback: string): never {
  throw new Error(error?.message || fallback);
}

/**
 * QUOTATIONS. All writes go through Postgres functions that take the user's
 * identity from their login and calculate totals on the server.
 */

type SubmitQuotationInput = {
  rfqId: string;
  productDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  deliveryTerms?: string;
  paymentTerms?: string;
  message?: string;
};

export async function submitQuotation(input: SubmitQuotationInput) {
  const { data, error } = await supabase.rpc("submit_quotation", {
    p_rfq_id: input.rfqId,
    p_product_description: input.productDescription,
    p_quantity: input.quantity,
    p_unit: input.unit,
    p_unit_price: input.unitPrice,
    p_delivery_terms: input.deliveryTerms || null,
    p_payment_terms: input.paymentTerms || null,
    p_message: input.message || null,
  });
  if (error) fail(error, "Could not submit quotation.");
  return data;
}

export async function getQuotationsForRfq(rfqId: string) {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("rfq_id", rfqId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quotations:", error);
    return [];
  }
  return data;
}

export async function getRfqById(id: string) {
  const { data, error } = await supabase
    .from("rfqs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching RFQ:", error);
    return null;
  }
  return data;
}

/**
 * ACCEPT QUOTATION. Buyer only. One atomic database transaction: creates the
 * order from the verified quotation, rejects other quotations, closes the RFQ.
 */
export async function acceptQuotation(quotationId: string, paymentMethod: string) {
  const { data, error } = await supabase.rpc("accept_quotation", {
    p_quotation_id: quotationId,
    p_payment_method: paymentMethod,
  });
  if (error) fail(error, "Could not accept quotation.");
  return data;
}

/**
 * B2B ORDERS
 */

export async function getB2BOrderById(id: string) {
  const { data, error } = await supabase
    .from("b2b_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching B2B order:", error);
    return null;
  }
  return data;
}

export async function getB2BOrdersByBuyer(email: string) {
  const { data, error } = await supabase
    .from("b2b_orders")
    .select("*")
    .eq("buyer_email", email)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function getB2BOrdersBySeller(email: string) {
  const { data, error } = await supabase
    .from("b2b_orders")
    .select("*")
    .eq("seller_email", email)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

/**
 * MILESTONES
 */

export async function getMilestones(b2bOrderId: string) {
  const { data, error } = await supabase
    .from("b2b_payment_milestones")
    .select("*")
    .eq("b2b_order_id", b2bOrderId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data;
}

export async function addMilestone(
  b2bOrderId: string,
  label: string,
  amount: number,
  paymentMethod: "online" | "bank_transfer"
) {
  const { data, error } = await supabase.rpc("add_b2b_milestone", {
    p_order_id: b2bOrderId,
    p_label: label,
    p_amount: amount,
    p_payment_method: paymentMethod,
  });
  if (error) fail(error, "Could not add milestone.");
  return data;
}

// Buyer claims a bank transfer was made. Status becomes "submitted", never
// "confirmed". Only an admin can confirm it. The email argument is ignored:
// the server uses the logged-in user.
export async function submitBankTransferClaim(milestoneId: string, _submittedByEmail: string, proofReference: string) {
  const { data, error } = await supabase.rpc("submit_bank_transfer_claim", {
    p_milestone_id: milestoneId,
    p_proof_reference: proofReference,
  });
  if (error) fail(error, "Could not submit transfer details.");
  return data;
}

async function recomputeB2BOrderPaymentStatus(b2bOrderId: string) {
  const { error } = await supabase.rpc("b2b_recompute_payment_status", { p_order_id: b2bOrderId });
  if (error) console.error("Error recomputing payment status:", error);
}

// ADMIN ONLY. Enforced in the database (is_admin()); the email argument is ignored.
export async function confirmMilestonePayment(milestoneId: string, _adminEmail?: string) {
  const { data, error } = await supabase.rpc("review_b2b_milestone", {
    p_milestone_id: milestoneId,
    p_approve: true,
  });
  if (error) fail(error, "Could not confirm payment.");
  return data;
}

// ADMIN ONLY. Enforced in the database (is_admin()); the email argument is ignored.
export async function rejectMilestonePayment(milestoneId: string, _adminEmail?: string) {
  const { data, error } = await supabase.rpc("review_b2b_milestone", {
    p_milestone_id: milestoneId,
    p_approve: false,
  });
  if (error) fail(error, "Could not reject payment.");
  return data;
}

export { recomputeB2BOrderPaymentStatus };