"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getRfqById, getQuotationsForRfq, submitQuotation, acceptQuotation } from "@/lib/b2b";

export default function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [rfq, setRfq] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const [form, setForm] = useState({
    productDescription: "", quantity: "", unitPrice: "", deliveryTerms: "", paymentTerms: "", message: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Record<string, string>>({});

  useEffect(function () {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);

      const r = await getRfqById(id);
      if (!r) { router.push("/rfq"); return; }
      setRfq(r);

      const q = await getQuotationsForRfq(id);
      setQuotations(q);
      setLoading(false);
    }
    if (id) load();
  }, [id, router]);

  const isBuyer = user && rfq && user.email === rfq.buyer_email;

  async function handleSubmitQuotation(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push("/auth/login"); return; }
    setSubmitting(true);
    try {
      await submitQuotation({
        rfqId: id,
        supplierEmail: user.email,
        productDescription: form.productDescription,
        quantity: form.quantity,
        unitPrice: Number(form.unitPrice),
        deliveryTerms: form.deliveryTerms,
        paymentTerms: form.paymentTerms,
        message: form.message,
      });
      const q = await getQuotationsForRfq(id);
      setQuotations(q);
      setForm({ productDescription: "", quantity: "", unitPrice: "", deliveryTerms: "", paymentTerms: "", message: "" });
      alert("Quotation submitted.");
    } catch (err) {
      console.error(err);
      alert("Could not submit quotation.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(quotationId: string) {
    if (!user) return;
    const method = selectedPaymentMethod[quotationId] || "bank_transfer";
    setAccepting(quotationId);
    try {
      const order = await acceptQuotation(quotationId, user.email, method);
      router.push(`/b2b-orders/${order.id}`);
    } catch (err) {
      console.error(err);
      alert("Could not accept this quotation.");
      setAccepting(null);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fff7f0]">
      <div className="w-10 h-10 border-[3px] border-[#ea580c] border-t-transparent rounded-full animate-spin" />
    </div>;
  }
  if (!rfq) return null;

  return (
    <div className="min-h-screen bg-[#fff7f0]">
      <div className="bg-gradient-to-r from-[#ea580c] to-[#c2410c] text-white py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-black mb-2">{rfq.title}</h1>
          <p className="text-white/80">{rfq.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-gray-500 font-semibold mb-1">Category</p><p className="font-bold text-gray-900">{rfq.category}</p></div>
          <div><p className="text-xs text-gray-500 font-semibold mb-1">Quantity</p><p className="font-bold text-gray-900">{rfq.quantity}</p></div>
          <div><p className="text-xs text-gray-500 font-semibold mb-1">Budget</p><p className="font-bold text-[#ea580c]">{rfq.budget}</p></div>
          <div><p className="text-xs text-gray-500 font-semibold mb-1">Status</p><p className="font-bold text-gray-900 capitalize">{rfq.status}</p></div>
        </div>

        {!isBuyer && rfq.status === "open" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-4">Submit a Quotation</h2>
            <form onSubmit={handleSubmitQuotation} className="space-y-4">
              <input required placeholder="What you're offering (product/service)" value={form.productDescription}
                onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Quantity (e.g. 5000 kg)" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
                <input required type="number" placeholder="Total price (₦)" value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <input placeholder="Delivery terms" value={form.deliveryTerms}
                onChange={(e) => setForm({ ...form, deliveryTerms: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
              <input placeholder="Payment terms (e.g. 30% deposit, balance on delivery)" value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
              <textarea placeholder="Additional message" value={form.message} rows={3}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
              <button type="submit" disabled={submitting}
                className="w-full bg-[#ea580c] hover:bg-[#c2410c] disabled:bg-gray-300 text-white py-3 rounded-lg font-bold text-sm transition">
                {submitting ? "Submitting..." : "Submit Quotation"}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Quotations ({quotations.length})</h2>
          {quotations.length === 0 ? (
            <p className="text-gray-400 text-sm">No quotations yet.</p>
          ) : (
            <div className="space-y-4">
              {quotations.map((q) => (
                <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-gray-900">{q.product_description}</p>
                      <p className="text-sm text-gray-500">{q.quantity} — ₦{Number(q.total_price).toLocaleString()}</p>
                      {q.delivery_terms && <p className="text-xs text-gray-500 mt-1">Delivery: {q.delivery_terms}</p>}
                      {q.payment_terms && <p className="text-xs text-gray-500">Payment terms: {q.payment_terms}</p>}
                      <p className="text-xs text-gray-400 mt-1">From: {q.supplier_email}</p>
                      <span className={"inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold " +
                        (q.status === "accepted" ? "bg-green-100 text-green-700" : q.status === "rejected" ? "bg-gray-100 text-gray-500" : "bg-amber-100 text-amber-700")}>
                        {q.status}
                      </span>
                    </div>

                    {isBuyer && q.status === "pending" && rfq.status === "open" && (
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <select
                          value={selectedPaymentMethod[q.id] || "bank_transfer"}
                          onChange={(e) => setSelectedPaymentMethod({ ...selectedPaymentMethod, [q.id]: e.target.value })}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs"
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="online">Pay Online</option>
                          <option value="deposit">Deposit + Balance</option>
                          <option value="milestone">Milestone Payments</option>
                          <option value="credit_terms">Credit Terms</option>
                        </select>
                        <button
                          onClick={() => handleAccept(q.id)}
                          disabled={accepting === q.id}
                          className="bg-[#ea580c] hover:bg-[#c2410c] disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-xs font-bold transition"
                        >
                          {accepting === q.id ? "Accepting..." : "Accept Quotation"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
