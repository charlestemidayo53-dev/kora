"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { acceptQuotation, getQuotationsForRfq, getRfqById, submitQuotation } from "@/lib/b2b";

// Display hint only. The database enforces the real online-payment limit.
const ONLINE_LIMIT = 5000000;

const UNITS = ["kg", "ton", "liter", "pieces", "boxes", "bags"];

type Rfq = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  quantity: string | null;
  budget: string | null;
  deadline: string | null;
  urgency: string | null;
  buyer: string;
  buyer_email: string;
  status: string | null;
  target_seller_email: string | null;
};

type Quotation = {
  id: string;
  supplier_email: string;
  product_description: string;
  quantity: string;
  unit_price: number | string;
  total_price: number | string;
  delivery_terms: string | null;
  payment_terms: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

function naira(value: number | string) {
  return "N" + Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 });
}

function profileName(profile: any): string {
  return profile?.business_name || profile?.company_name || profile?.full_name || profile?.name || "Supplier";
}

function statusClass(status: string) {
  if (status === "accepted") return "bg-green-100 text-green-700 border-green-300";
  if (status === "rejected") return "bg-red-100 text-red-700 border-red-300";
  return "bg-orange-50 text-[#ea580c] border-orange-200";
}

const inputClass =
  "w-full border border-gray-300 bg-white px-4 py-3 text-sm focus:border-[#ea580c] focus:outline-none focus:ring-1 focus:ring-[#ea580c]";
const labelClass = "mb-2 block text-sm font-bold text-gray-900";

export default function RfqDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [myEmail, setMyEmail] = useState<string | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [productDescription, setProductDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [unitPrice, setUnitPrice] = useState("");
  const [deliveryTerms, setDeliveryTerms] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  async function loadQuotations(rfqId: string) {
    const list = (await getQuotationsForRfq(rfqId)) as Quotation[];
    setQuotations(list);
    const emails = Array.from(new Set(list.map((q) => q.supplier_email)));
    if (emails.length > 0) {
      const { data } = await supabase.from("public_profiles").select("*").in("email", emails);
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => {
        map[String(p.email).toLowerCase()] = profileName(p);
      });
      setNames(map);
    }
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [rfqData, user] = await Promise.all([getRfqById(id), getUser()]);
      if (cancelled) return;
      setRfq(rfqData as Rfq | null);
      const email = user?.email ? user.email.toLowerCase() : null;
      setMyEmail(email);
      if (rfqData) {
        setProductDescription((rfqData as Rfq).title);
        if (email) await loadQuotations(id);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const qtyNum = Number(quantity);
  const priceNum = Number(unitPrice);
  const previewTotal = qtyNum > 0 && priceNum > 0 ? Math.round(qtyNum * priceNum * 100) / 100 : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!(qtyNum > 0)) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    if (!(priceNum > 0)) {
      setError("Enter a unit price greater than zero.");
      return;
    }
    setSubmitting(true);
    try {
      await submitQuotation({
        rfqId: id,
        productDescription,
        quantity: qtyNum,
        unit,
        unitPrice: priceNum,
        deliveryTerms,
        paymentTerms,
        message,
      });
      setNotice("Your quotation has been sent to the buyer.");
      setQuantity("");
      setUnitPrice("");
      setDeliveryTerms("");
      setPaymentTerms("");
      setMessage("");
      await loadQuotations(id);
    } catch (err: any) {
      setError(err.message || "Could not submit quotation.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(q: Quotation) {
    setError("");
    setNotice("");
    if (!window.confirm("Accept this quotation? This closes the request and creates an order.")) return;
    setAcceptingId(q.id);
    try {
      const order: any = await acceptQuotation(q.id, paymentMethod);
      setNotice("Quotation accepted. Order " + String(order.id).slice(0, 8).toUpperCase() + " has been created.");
      setRfq((await getRfqById(id)) as Rfq | null);
      await loadQuotations(id);
    } catch (err: any) {
      setError(err.message || "Could not accept quotation.");
    } finally {
      setAcceptingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center bg-gray-50 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#ea580c] border-t-transparent" />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24 text-center">
        <p className="mb-2 text-lg font-black text-gray-800">Request not found</p>
        <Link href="/rfq" className="text-sm font-bold text-[#ea580c]">Back to all requests</Link>
      </div>
    );
  }

  const isBuyer = !!myEmail && rfq.buyer_email.toLowerCase() === myEmail;
  const isOpen = rfq.status === "open";
  const targetedToOther =
    !!rfq.target_seller_email && !!myEmail && rfq.target_seller_email.toLowerCase() !== myEmail;
  const canQuote = !!myEmail && !isBuyer && isOpen && !targetedToOther;
  const myPending = quotations.find(
    (q) => myEmail && q.supplier_email.toLowerCase() === myEmail && q.status === "pending"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <Link href="/rfq" className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
            Back to requests
          </Link>
          <h1 className="mt-3 text-2xl font-black text-gray-900 md:text-3xl">{rfq.title}</h1>
          <div className="mt-3 h-[3px] w-12 bg-[#ea580c]" />
          {rfq.description && <p className="mt-4 text-sm leading-relaxed text-gray-600">{rfq.description}</p>}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-500">Category</p>
              <p className="font-bold text-gray-900">{rfq.category || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-500">Quantity</p>
              <p className="font-bold text-gray-900">{rfq.quantity || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-500">Budget</p>
              <p className="font-bold text-[#ea580c]">{rfq.budget || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-500">Needed by</p>
              <p className="font-bold text-gray-900">
                {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
          <p className="mt-5 text-xs text-gray-500">
            Posted by {rfq.buyer} -{" "}
            <span className={"border px-2 py-0.5 font-bold " + statusClass(isOpen ? "pending" : "rejected")}>
              {isOpen ? "Open" : "Closed"}
            </span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}
        {notice && (
          <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>
        )}

        {!myEmail && (
          <div className="border border-gray-200 bg-white p-6 text-center">
            <p className="mb-4 text-sm text-gray-600">Sign in to respond to this request.</p>
            <Link
              href="/auth/login"
              className="inline-block bg-[#ea580c] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c2410c]"
            >
              Sign in
            </Link>
          </div>
        )}

        {targetedToOther && (
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
            This request was sent to a specific supplier.
          </div>
        )}

        {myEmail && !isBuyer && !isOpen && !myPending && (
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
            This request is closed and no longer accepting quotations.
          </div>
        )}

        {/* Supplier: quotation form */}
        {canQuote && !myPending && (
          <form onSubmit={handleSubmit} className="space-y-5 border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#ea580c]">Send a Quotation</h2>
            <div>
              <label className={labelClass}>Product you will supply</label>
              <input
                className={inputClass}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                maxLength={2000}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Unit</label>
                <select className={inputClass} value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Price per unit (N)</label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="border-l-4 border-[#ea580c] bg-[#fff7ed] px-4 py-3">
              <p className="text-xs font-semibold text-gray-500">Total quotation</p>
              <p className="text-xl font-black text-[#ea580c]">{previewTotal > 0 ? naira(previewTotal) : "N0"}</p>
            </div>
            <div>
              <label className={labelClass}>Delivery terms</label>
              <input
                className={inputClass}
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                maxLength={1000}
                placeholder="e.g., Delivered to buyer's warehouse within 7 days"
              />
            </div>
            <div>
              <label className={labelClass}>Payment terms</label>
              <input
                className={inputClass}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                maxLength={1000}
                placeholder="e.g., 50% before dispatch, 50% on delivery"
              />
            </div>
            <div>
              <label className={labelClass}>Message to buyer (optional)</label>
              <textarea
                className={inputClass}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#ea580c] py-4 text-base font-black text-white transition hover:bg-[#c2410c] disabled:bg-gray-300"
            >
              {submitting ? "Sending..." : "Send Quotation"}
            </button>
          </form>
        )}

        {/* Quotations list: the buyer sees all, a supplier sees only their own */}
        {myEmail && quotations.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black text-gray-900">
                {isBuyer ? "Quotations received (" + quotations.length + ")" : "Your quotation"}
              </h2>
              {isBuyer && isOpen && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-600">Payment method</label>
                  <select
                    className="border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="online">Online payment (up to {naira(ONLINE_LIMIT)})</option>
                    <option value="milestone">Milestone payments</option>
                  </select>
                </div>
              )}
            </div>

            {quotations.map((q) => {
              const tooLargeForOnline = paymentMethod === "online" && Number(q.total_price) > ONLINE_LIMIT;
              return (
                <div key={q.id} className="border border-gray-200 border-l-4 border-l-[#ea580c] bg-white p-5 shadow-sm md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {isBuyer ? names[q.supplier_email.toLowerCase()] || "Supplier" : "Your quotation"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{q.product_description}</p>
                    </div>
                    <span className={"border px-3 py-1 text-xs font-bold " + statusClass(q.status)}>
                      {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-500">Quantity</p>
                      <p className="font-bold text-gray-900">{q.quantity}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-500">Unit price</p>
                      <p className="font-bold text-gray-900">{naira(q.unit_price)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-500">Total</p>
                      <p className="font-black text-[#ea580c]">{naira(q.total_price)}</p>
                    </div>
                  </div>

                  {(q.delivery_terms || q.payment_terms || q.message) && (
                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                      {q.delivery_terms && <p><span className="font-bold text-gray-800">Delivery:</span> {q.delivery_terms}</p>}
                      {q.payment_terms && <p><span className="font-bold text-gray-800">Payment:</span> {q.payment_terms}</p>}
                      {q.message && <p><span className="font-bold text-gray-800">Message:</span> {q.message}</p>}
                    </div>
                  )}

                  {isBuyer && (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {isOpen && q.status === "pending" && (
                        <button
                          onClick={() => handleAccept(q)}
                          disabled={acceptingId !== null || tooLargeForOnline}
                          className="bg-[#ea580c] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#c2410c] disabled:bg-gray-300"
                        >
                          {acceptingId === q.id ? "Accepting..." : "Accept Quotation"}
                        </button>
                      )}
                      <Link
                        href={"/message?to=" + encodeURIComponent(q.supplier_email)}
                        className="border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-600 transition hover:border-[#ea580c] hover:text-[#ea580c]"
                      >
                        Message Supplier
                      </Link>
                      {tooLargeForOnline && (
                        <p className="text-xs text-red-600">
                          Orders above {naira(ONLINE_LIMIT)} must be paid by bank transfer.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isBuyer && quotations.length === 0 && (
          <div className="border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            No quotations yet. Suppliers will respond here.
          </div>
        )}
      </div>
    </div>
  );
}