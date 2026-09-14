"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import { getB2BOrderById, getMilestones, submitBankTransferClaim } from "@/lib/b2b";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => void;
  }
}

export default function B2BOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [order, setOrder] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flwReady, setFlwReady] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [proofText, setProofText] = useState<Record<string, string>>({});

  async function refresh() {
    const o = await getB2BOrderById(id);
    setOrder(o);
    const m = await getMilestones(id);
    setMilestones(m);
  }

  useEffect(function () {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      await refresh();
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const isBuyer = user && order && user.email === order.buyer_email;

  async function payMilestoneOnline(milestone: any) {
    if (!flwReady) return;
    setPayingId(milestone.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) { router.push("/auth/login"); return; }

      const initRes = await fetch("/api/payments/b2b-initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: milestone.id, accessToken }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) { alert(initData.error || "Could not start payment."); setPayingId(null); return; }

      window.FlutterwaveCheckout?.({
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: initData.tx_ref,
        amount: initData.amount,
        currency: initData.currency,
        payment_options: "card, banktransfer, ussd",
        customer: initData.customer,
        customizations: { title: "Kora B2B", description: `Payment for ${order.product_description}` },
        callback: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payments/b2b-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transaction_id: response.transaction_id }),
            });
            if (!verifyRes.ok) {
              const d = await verifyRes.json();
              alert(d.error || "Payment could not be verified.");
            }
          } finally {
            setPayingId(null);
            await refresh();
          }
        },
        onclose: () => setPayingId(null),
      });
    } catch (err) {
      console.error(err);
      setPayingId(null);
    }
  }

  async function claimBankTransfer(milestoneId: string) {
    if (!user) return;
    const reference = proofText[milestoneId];
    if (!reference) { alert("Enter your bank transfer reference/details first."); return; }
    setClaimingId(milestoneId);
    try {
      await submitBankTransferClaim(milestoneId, user.email, reference);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Could not submit claim.");
    } finally {
      setClaimingId(null);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
      <div className="w-10 h-10 border-[3px] border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
    </div>;
  }
  if (!order) return null;

  return (
    <>
      <Script src="https://checkout.flutterwave.com/v3.js" onLoad={() => setFlwReady(true)} />
      <div className="min-h-screen bg-[#f0faf4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-black text-[#1a4731]">B2B Order Agreement</h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f0faf4] text-[#2e8b5a] border border-[#c3e6d3]">
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-500">Buyer</p><p className="font-semibold">{order.buyer_email}</p></div>
              <div><p className="text-xs text-gray-500">Seller</p><p className="font-semibold">{order.seller_email}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Product/Service</p><p className="font-semibold">{order.product_description}</p></div>
              <div><p className="text-xs text-gray-500">Quantity</p><p className="font-semibold">{order.quantity}</p></div>
              <div><p className="text-xs text-gray-500">Total Amount</p><p className="font-black text-[#2e8b5a] text-lg">₦{Number(order.total_amount).toLocaleString()}</p></div>
              {order.delivery_terms && <div className="col-span-2"><p className="text-xs text-gray-500">Delivery Terms</p><p className="font-semibold">{order.delivery_terms}</p></div>}
              {order.payment_terms && <div className="col-span-2"><p className="text-xs text-gray-500">Payment Terms</p><p className="font-semibold">{order.payment_terms}</p></div>}
              <div><p className="text-xs text-gray-500">Payment Method</p><p className="font-semibold capitalize">{order.payment_method.replace("_", " ")}</p></div>
              <div><p className="text-xs text-gray-500">Payment Status</p><p className="font-semibold capitalize">{order.payment_status.replace("_", " ")}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-black text-gray-900 mb-4">Payments</h2>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-800">{m.label}</p>
                    <span className={"text-xs font-bold px-2.5 py-0.5 rounded-full " +
                      (m.status === "confirmed" ? "bg-green-100 text-green-700"
                        : m.status === "submitted" ? "bg-blue-100 text-blue-700"
                        : m.status === "rejected" ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700")}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">₦{Number(m.amount).toLocaleString()} — {m.payment_method === "online" ? "Online payment" : "Bank transfer"}</p>

                  {isBuyer && m.status === "pending" && m.payment_method === "online" && (
                    <button
                      onClick={() => payMilestoneOnline(m)}
                      disabled={payingId === m.id || !flwReady}
                      className="bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                    >
                      {payingId === m.id ? "Opening payment..." : "Pay Online"}
                    </button>
                  )}

                  {isBuyer && m.status === "pending" && m.payment_method === "bank_transfer" && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Transfer this amount to Kora's settlement account (details provided by Kora admin), then enter your transfer reference below.</p>
                      <input
                        placeholder="Bank transfer reference / details"
                        value={proofText[m.id] || ""}
                        onChange={(e) => setProofText({ ...proofText, [m.id]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => claimBankTransfer(m.id)}
                        disabled={claimingId === m.id}
                        className="bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                      >
                        {claimingId === m.id ? "Submitting..." : "I've Made This Payment"}
                      </button>
                    </div>
                  )}

                  {m.status === "submitted" && (
                    <p className="text-xs text-blue-600">Awaiting admin confirmation of your bank transfer.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
