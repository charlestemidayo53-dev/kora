import { supabase } from "./supabase";

/**
 * QUOTATIONS — a supplier's response to an RFQ
 */

type SubmitQuotationInput = {
  rfqId: string;
  supplierEmail: string;
  productDescription: string;
  quantity: string;
  unitPrice: number;
  deliveryTerms?: string;
  paymentTerms?: string;
  message?: string;
};

export async function submitQuotation(input: SubmitQuotationInput) {
  const totalPrice = input.unitPrice; // caller passes a pre-multiplied unit price if needed
  const { data, error } = await supabase
    .from("quotations")
    .insert([{
      rfq_id: input.rfqId,
      supplier_email: input.supplierEmail,
      product_description: input.productDescription,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      total_price: totalPrice,
      delivery_terms: input.deliveryTerms || null,
      payment_terms: input.paymentTerms || null,
      message: input.message || null,
      status: "pending",
    }])
    .select()
    .single();

  if (error) throw error;
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
 * ACCEPT QUOTATION — snapshots the agreed terms into a new b2b_order,
 * rejects the RFQ's other quotations, and closes the RFQ.
 */

export async function acceptQuotation(quotationId: string, buyerEmail: string, paymentMethod: string) {
  const { data: quotation, error: qError } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", quotationId)
    .single();

  if (qError || !quotation) throw new Error("Quotation not found.");

  const rfq = await getRfqById(quotation.rfq_id);
  if (!rfq) throw new Error("Original RFQ not found.");

  const { data: b2bOrder, error: orderError } = await supabase
    .from("b2b_orders")
    .insert([{
      rfq_id: quotation.rfq_id,
      quotation_id: quotation.id,
      buyer_email: buyerEmail,
      seller_email: quotation.supplier_email,
      product_description: quotation.product_description,
      quantity: quotation.quantity,
      unit_price: quotation.unit_price,
      total_amount: quotation.total_price,
      delivery_terms: quotation.delivery_terms,
      payment_terms: quotation.payment_terms,
      payment_method: paymentMethod,
      payment_status: "unpaid",
      fulfilment_status: "pending",
      status: "confirmed",
    }])
    .select()
    .single();

  if (orderError) throw orderError;

  await supabase.from("quotations").update({ status: "accepted" }).eq("id", quotationId);
  await supabase.from("quotations").update({ status: "rejected" }).eq("rfq_id", quotation.rfq_id).neq("id", quotationId);
  await supabase.from("rfqs").update({ status: "closed" }).eq("id", quotation.rfq_id);

  // Default: a single milestone covering the full amount. For the
  // "milestone" payment method, buyer/seller can break this into more
  // rows afterward from the order page.
  await supabase.from("b2b_payment_milestones").insert([{
    b2b_order_id: b2bOrder.id,
    label: "Full Payment",
    amount: b2bOrder.total_amount,
    payment_method: paymentMethod === "online" ? "online" : "bank_transfer",
    status: "pending",
  }]);

  return b2bOrder;
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

export async function addMilestone(b2bOrderId: string, label: string, amount: number, paymentMethod: "online" | "bank_transfer") {
  const { data, error } = await supabase
    .from("b2b_payment_milestones")
    .insert([{
      b2b_order_id: b2bOrderId,
      label,
      amount,
      payment_method: paymentMethod,
      status: "pending",
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Buyer claims they've made a bank transfer — status becomes "submitted",
// NOT "confirmed". Only an admin can confirm it (see confirmMilestonePayment).
export async function submitBankTransferClaim(milestoneId: string, submittedByEmail: string, proofReference: string) {
  const { data, error } = await supabase
    .from("b2b_payment_milestones")
    .update({
      status: "submitted",
      submitted_by: submittedByEmail,
      submitted_at: new Date().toISOString(),
      proof_reference: proofReference,
    })
    .eq("id", milestoneId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function recomputeB2BOrderPaymentStatus(b2bOrderId: string) {
  const { data: order } = await supabase.from("b2b_orders").select("total_amount").eq("id", b2bOrderId).single();
  if (!order) return;

  const { data: milestones } = await supabase
    .from("b2b_payment_milestones")
    .select("amount, status")
    .eq("b2b_order_id", b2bOrderId);

  const confirmedTotal = (milestones || [])
    .filter((m: any) => m.status === "confirmed")
    .reduce((sum: number, m: any) => sum + Number(m.amount), 0);

  let paymentStatus: "unpaid" | "partially_paid" | "paid" = "unpaid";
  if (confirmedTotal >= Number(order.total_amount)) paymentStatus = "paid";
  else if (confirmedTotal > 0) paymentStatus = "partially_paid";

  await supabase.from("b2b_orders").update({ payment_status: paymentStatus }).eq("id", b2bOrderId);
}

// ADMIN ONLY — the calling page must gate this behind requireAdmin().
export async function confirmMilestonePayment(milestoneId: string, adminEmail: string) {
  const { data: milestone, error } = await supabase
    .from("b2b_payment_milestones")
    .update({
      status: "confirmed",
      confirmed_by: adminEmail,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", milestoneId)
    .select()
    .single();

  if (error) throw error;
  await recomputeB2BOrderPaymentStatus(milestone.b2b_order_id);
  return milestone;
}

// ADMIN ONLY — same gating requirement as above.
export async function rejectMilestonePayment(milestoneId: string, adminEmail: string) {
  const { data, error } = await supabase
    .from("b2b_payment_milestones")
    .update({
      status: "rejected",
      confirmed_by: adminEmail,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", milestoneId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export { recomputeB2BOrderPaymentStatus };
