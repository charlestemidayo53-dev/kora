"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import { getB2BOrderById, getMilestones, submitBankTransferClaim } from "@/lib/b2b";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => void;
  }
}

type SettlementAccount = {
  bank_name: string;
  account_name: string;
  account_number: string;
  payment_reference: string;
};

type ScheduleRow = { label: string; amount: string; method: "online" | "bank_transfer" };

const inputClass =
  "w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#ea580c] focus:outline-none focus:ring-1 focus:ring-[#ea580c]";

function naira(value: number | string) {
  return "\u20A6" + Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 });
}

function pretty(value: any) {
  return String(value || "").replace(/_/g, " ");
}

function badgeClass(status: string) {
  if (status === "confirmed" || status === "paid") return "bg-green-100 text-green-700 border-green-300";
  if (status === "submitted" || status === "partially_paid") return "bg-blue-100 text-blue-700 border-blue-300";
  if (status === "rejected") return "bg-red-100 text-red-700 border-red-300";
  return "bg-orange-50 text-[#ea580c] border-orange-200";
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
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [account, setAccount] = useState<SettlementAccount | null>(null);
  const [accountChecked, setAccountChecked] = useState(false);
  const [onlineLimit, setOnlineLimit] = useState<number | null>(null);
  const [showSplit, setShowSplit] = useState(false);
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [splitting, setSplitting] = useState(false);

  async function refresh() {
    const o = await getB2BOrderById(id);
    setOrder(o);
    const m = await getMilestones(id);
    setMilestones(m);
  }

  useEffect(function () {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      await refresh();
      const { data: limit } = await supabase.rpc("b2b_online_limit");
      if (limit !== null && limit !== undefined && Number(limit) > 0) setOnlineLimit(Number(limit));
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const myEmail = user?.email ? String(user.email).toLowerCase() : "";
  const isBuyer = !!order && !!myEmail && String(order.buyer_email).toLowerCase() === myEmail;

  const needsBankDetails =
    isBuyer &&
    milestones.some(function (m) {
      return m.payment_method === "bank_transfer" && (m.status === "pending" || m.status === "rejected");
    });

  useEffect(
    function () {
      if (!needsBankDetails || accountChecked) return;
      (async function () {
        const { data, error: rpcError } = await supabase.rpc("get_settlement_account", { p_order_id: id });
        if (!rpcError && Array.isArray(data) && data.length > 0) setAccount(data[0] as SettlementAccount);
        setAccountChecked(true);
      })();
    },
    [needsBankDetails, accountChecked, id],
  );

  async function payMilestoneOnline(milestone: any) {
    if (!flwReady) return;
    setError("");
    setNotice("");
    setPayingId(milestone.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        router.push("/auth/login");
        return;
      }

      const initRes = await fetch("/api/payments/b2b-initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
        body: JSON.stringify({ milestoneId: milestone.id }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) {
        setError(initData.error || "Could not start payment.");
        setPayingId(null);
        return;
      }

      window.FlutterwaveCheckout?.({
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: initData.tx_ref,
        amount: initData.amount,
        currency: initData.currency,
        payment_options: "card, banktransfer, ussd",
        customer: initData.customer,
        customizations: { title: "Kora B2B", description: "Payment for " + order.product_description },
        callback: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/b2b-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
              body: JSON.stringify({ transaction_id: response.transaction_id }),
            });
            if (!verifyRes.ok) {
              const d = await verifyRes.json();
              setError(d.error || "Payment could not be verified.");
            } else {
              setNotice("Payment received and verified.");
            }
          } finally {
            setPayingId(null);
            await refresh();
          }
        },
        onclose: function () {
          setPayingId(null);
        },
      });
    } catch (err) {
      console.error(err);
      setError("Could not start payment. Please try again.");
      setPayingId(null);
    }
  }

  async function claimBankTransfer(milestoneId: string) {
    if (!user) return;
    setError("");
    setNotice("");
    const reference = (proofText[milestoneId] || "").trim();
    if (reference.length < 3 || reference.length > 200) {
      setError("Enter your bank transfer reference (3 to 200 characters).");
      return;
    }
    setClaimingId(milestoneId);
    try {
      await submitBankTransferClaim(milestoneId, user.email, reference);
      setNotice("Transfer details submitted. An admin will confirm your payment.");
      await refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Could not submit your transfer details.");
    } finally {
      setClaimingId(null);
    }
  }

  const total = order ? Number(order.total_amount) : 0;
  const rowsSum = rows.reduce(function (sum, r) {
    return sum + (Number(r.amount) > 0 ? Number(r.amount) : 0);
  }, 0);
  const remaining = Math.round((total - rowsSum) * 100) / 100;

  const canSplit =
    isBuyer &&
    !!order &&
    order.payment_status === "unpaid" &&
    milestones.every(function (m) {
      return m.status === "pending" && !m.tx_ref;
    });

  function openSplit() {
    setError("");
    setNotice("");
    setRows([
      { label: "Deposit", amount: "", method: "bank_transfer" },
      { label: "Balance", amount: "", method: "bank_transfer" },
    ]);
    setShowSplit(true);
  }

  function updateRow(index: number, patch: Partial<ScheduleRow>) {
    setRows(function (prev) {
      return prev.map(function (r, i) {
        return i === index ? { ...r, ...patch } : r;
      });
    });
  }

  async function submitSplit() {
    setError("");
    setNotice("");
    if (rows.length < 1 || rows.length > 10) {
      setError("Use between 1 and 10 payments.");
      return;
    }
    for (const r of rows) {
      const amount = Number(r.amount);
      if (!r.label.trim() || r.label.trim().length > 100) {
        setError("Every payment needs a label.");
        return;
      }
      if (!(amount > 0)) {
        setError("Every payment needs an amount above zero.");
        return;
      }
      if (r.method === "online" && onlineLimit !== null && amount > onlineLimit) {
        setError("A payment above " + naira(onlineLimit) + " must be paid by bank transfer.");
        return;
      }
    }
    if (remaining !== 0) {
      setError("The payments must add up exactly to " + naira(total) + ".");
      return;
    }
    setSplitting(true);
    try {
      const { error: rpcError } = await supabase.rpc("split_b2b_order_payment", {
        p_order_id: id,
        p_items: rows.map(function (r) {
          return { label: r.label.trim(), amount: Number(r.amount), method: r.method };
        }),
      });
      if (rpcError) throw rpcError;
      setShowSplit(false);
      setAccountChecked(false);
      setNotice("Payment schedule saved.");
      await refresh();
    } catch (err: any) {
      setError(err?.message || "Could not save the payment schedule.");
    } finally {
      setSplitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#ea580c] border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24 text-center">
        <p className="mb-2 text-lg font-black text-gray-800">Order not found</p>
        <Link href="/orders" className="text-sm font-bold text-[#ea580c]">Back to orders</Link>
      </div>
    );
  }

  const orderRef = "KORA-" + String(order.id).replace(/-/g, "").slice(0, 8).toUpperCase();

  return (
    <>
      <Script src="https://checkout.flutterwave.com/v3.js" onLoad={function () { setFlwReady(true); }} />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6">
          {error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          {notice && <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}

          {/* Agreement */}
          <div className="border border-gray-200 border-t-4 border-t-[#ea580c] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">Order {orderRef}</p>
                <h1 className="text-xl font-black text-gray-900">B2B Order Agreement</h1>
              </div>
              <span className="border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-[#ea580c]">
                {pretty(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-500">Buyer</p><p className="break-all font-semibold">{order.buyer_email}</p></div>
              <div><p className="text-xs text-gray-500">Seller</p><p className="break-all font-semibold">{order.seller_email}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Product / Service</p><p className="font-semibold">{order.product_description}</p></div>
              <div><p className="text-xs text-gray-500">Quantity</p><p className="font-semibold">{order.quantity}</p></div>
              <div><p className="text-xs text-gray-500">Total Amount</p><p className="text-lg font-black text-[#ea580c]">{naira(order.total_amount)}</p></div>
              {order.delivery_terms && <div className="col-span-2"><p className="text-xs text-gray-500">Delivery Terms</p><p className="font-semibold">{order.delivery_terms}</p></div>}
              {order.payment_terms && <div className="col-span-2"><p className="text-xs text-gray-500">Payment Terms</p><p className="font-semibold">{order.payment_terms}</p></div>}
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <span className={"mt-1 inline-block border px-2.5 py-0.5 text-xs font-bold capitalize " + badgeClass(order.payment_status)}>
                  {pretty(order.payment_status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fulfilment</p>
                <p className="font-semibold capitalize">{pretty(order.fulfilment_status)}</p>
              </div>
            </div>
          </div>

          {/* Bank transfer details (buyer only) */}
          {needsBankDetails && (
            <div className="border border-gray-200 border-l-4 border-l-[#ea580c] bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-[#ea580c]">Bank Transfer Details</h2>
              {account ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-gray-500">Bank</p><p className="font-semibold">{account.bank_name}</p></div>
                  <div><p className="text-xs text-gray-500">Account Name</p><p className="font-semibold">{account.account_name}</p></div>
                  <div><p className="text-xs text-gray-500">Account Number</p><p className="font-black tracking-wider">{account.account_number}</p></div>
                  <div><p className="text-xs text-gray-500">Use as transfer narration</p><p className="font-black text-[#ea580c]">{account.payment_reference}</p></div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {accountChecked
                    ? "The payment account is not available yet. Please contact korasupport1@gmail.com before you transfer."
                    : "Loading payment details..."}
                </p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                After you transfer, enter your bank reference below. Your payment is only marked as paid once a Kora admin confirms it.
              </p>
            </div>
          )}

          {/* Payments */}
          <div className="border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-black text-gray-900">Payments</h2>
              {canSplit && !showSplit && (
                <button
                  onClick={openSplit}
                  className="border border-[#ea580c] px-4 py-2 text-xs font-bold text-[#ea580c] transition hover:bg-orange-50"
                >
                  Split into milestones
                </button>
              )}
            </div>

            {showSplit && (
              <div className="mb-5 space-y-3 border border-orange-200 bg-orange-50/50 p-4">
                <p className="text-sm font-bold text-gray-900">Set your payment schedule</p>
                <p className="text-xs text-gray-600">
                  The payments must add up exactly to {naira(total)}.
                  {onlineLimit !== null ? " Online payments are limited to " + naira(onlineLimit) + " each; larger ones use bank transfer." : ""}
                </p>
                {rows.map(function (r, i) {
                  return (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <input
                        className={inputClass + " col-span-12 sm:col-span-4"}
                        placeholder="Label"
                        maxLength={100}
                        value={r.label}
                        onChange={function (e) { updateRow(i, { label: e.target.value }); }}
                      />
                      <input
                        className={inputClass + " col-span-6 sm:col-span-3"}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Amount"
                        value={r.amount}
                        onChange={function (e) { updateRow(i, { amount: e.target.value }); }}
                      />
                      <select
                        className={inputClass + " col-span-6 sm:col-span-4"}
                        value={r.method}
                        onChange={function (e) { updateRow(i, { method: e.target.value as "online" | "bank_transfer" }); }}
                      >
                        <option value="bank_transfer">Bank transfer</option>
                        <option value="online">Online payment</option>
                      </select>
                      <button
                        type="button"
                        disabled={rows.length <= 1}
                        onClick={function () { setRows(function (prev) { return prev.filter(function (_, idx) { return idx !== i; }); }); }}
                        className="col-span-12 text-xs font-bold text-red-500 disabled:text-gray-300 sm:col-span-1"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    disabled={rows.length >= 10}
                    onClick={function () { setRows(function (prev) { return [...prev, { label: "", amount: "", method: "bank_transfer" }]; }); }}
                    className="font-bold text-[#ea580c] disabled:text-gray-300"
                  >
                    + Add payment
                  </button>
                  <span className={remaining === 0 ? "font-bold text-green-700" : "font-bold text-red-600"}>
                    {remaining === 0 ? "Adds up to the total" : "Remaining: " + naira(remaining)}
                  </span>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={submitSplit}
                    disabled={splitting}
                    className="bg-[#ea580c] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#c2410c] disabled:bg-gray-300"
                  >
                    {splitting ? "Saving..." : "Save schedule"}
                  </button>
                  <button
                    onClick={function () { setShowSplit(false); }}
                    className="border border-gray-300 px-5 py-2.5 text-xs font-bold text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {milestones.map(function (m) {
                return (
                  <div key={m.id} className="border border-gray-200 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-bold text-gray-800">{m.label}</p>
                      <span className={"border px-2.5 py-0.5 text-xs font-bold capitalize " + badgeClass(m.status)}>
                        {m.status}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      {naira(m.amount)} - {m.payment_method === "online" ? "Online payment" : "Bank transfer"}
                    </p>

                    {isBuyer && m.status === "pending" && m.payment_method === "online" && (
                      <button
                        onClick={function () { payMilestoneOnline(m); }}
                        disabled={payingId === m.id || !flwReady}
                        className="bg-[#ea580c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#c2410c] disabled:bg-gray-300"
                      >
                        {payingId === m.id ? "Opening payment..." : "Pay Online"}
                      </button>
                    )}

                    {isBuyer && (m.status === "pending" || m.status === "rejected") && m.payment_method === "bank_transfer" && (
                      <div className="space-y-2">
                        {m.status === "rejected" && (
                          <p className="text-xs text-red-600">
                            We could not confirm this transfer. Check your reference and submit it again.
                          </p>
                        )}
                        <input
                          placeholder="Bank transfer reference"
                          maxLength={200}
                          value={proofText[m.id] || ""}
                          onChange={function (e) { setProofText({ ...proofText, [m.id]: e.target.value }); }}
                          className={inputClass}
                        />
                        <button
                          onClick={function () { claimBankTransfer(m.id); }}
                          disabled={claimingId === m.id}
                          className="bg-[#ea580c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#c2410c] disabled:bg-gray-300"
                        >
                          {claimingId === m.id ? "Submitting..." : "I've made this payment"}
                        </button>
                      </div>
                    )}

                    {m.status === "submitted" && (
                      <p className="text-xs text-blue-600">Awaiting admin confirmation of the bank transfer.</p>
                    )}
                  </div>
                );
              })}
              {milestones.length === 0 && <p className="text-sm text-gray-500">No payments scheduled yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}