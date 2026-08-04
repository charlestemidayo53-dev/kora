"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import { getOrdersByBuyer, getOrdersBySeller, updateOrder } from "@/lib/storage";

type Order = {
  id?: string;
  product_name?: string;
  productName?: string;
  buyer: string;
  seller: string;
  status: "pending" | "paid" | "completed" | string;
  amount?: string | number;
  escrow_status?: "holding" | "released" | "refunded" | null;
};

declare global {
  interface Window {
    FlutterwaveCheckout?: (options: any) => void;
  }
}

export default function EscrowPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      await loadOrders(data.user.email || "", activeTab);
      setLoading(false);
    }
    init();
  }, []);

  async function loadOrders(email: string, tab: "buyer" | "seller") {
    try {
      const data = tab === "buyer"
        ? await getOrdersByBuyer(email)
        : await getOrdersBySeller(email);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  }

  async function switchTab(tab: "buyer" | "seller") {
    setActiveTab(tab);
    if (user?.email) await loadOrders(user.email, tab);
  }

  // ---- PAY NOW: opens Flutterwave checkout, buyer pays the platform (not the seller directly) ----
  function handlePayNow(order: Order) {
    if (!order.id || !user?.email) return;

    if (!window.FlutterwaveCheckout) {
      alert("Payment is still loading. Wait a second and try again.");
      return;
    }

    const amountNumber = Number(order.amount);
    if (!amountNumber || amountNumber <= 0) {
      alert("This order has no valid amount set.");
      return;
    }

    setPayingId(order.id);

    const txRef = `kora_${order.id}_${Date.now()}`;

    window.FlutterwaveCheckout({
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: txRef,
      amount: amountNumber,
      currency: "NGN",
      payment_options: "card,banktransfer,ussd",
      customer: {
        email: user.email,
      },
      customizations: {
        title: "Kora Marketplace",
        description: `Payment for ${order.product_name || order.productName || "order"}`,
      },
      callback: async (response: any) => {
        try {
          if (response.status === "successful" || response.status === "completed") {
            const res = await fetch("/api/flutterwave/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transaction_id: response.transaction_id,
                order_id: order.id,
              }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) {
              alert("Payment could not be verified. Contact support with reference: " + txRef);
            }
          }
        } finally {
          setPayingId(null);
          if (user?.email) await loadOrders(user.email, activeTab);
        }
      },
      onclose: () => {
        setPayingId(null);
      },
    });
  }

  // ---- CONFIRM DELIVERY: releases escrow to seller ----
  async function handleConfirmDelivery(order: Order) {
    if (!order.id) return;
    setConfirmingId(order.id);
    try {
      const res = await fetch("/api/flutterwave/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || "Release failed");
      }
      if (user?.email) await loadOrders(user.email, activeTab);
    } catch (err) {
      console.error("Failed to confirm delivery:", err);
      alert("Could not release funds. Please try again or contact support.");
    } finally {
      setConfirmingId(null);
    }
  }

  const buyerTabClass = activeTab === "buyer"
    ? "flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#2e8b5a] border-b-2 border-[#2e8b5a] bg-[#f0faf4] transition-all"
    : "flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-400 hover:text-gray-600 transition-all";

  const sellerTabClass = activeTab === "seller"
    ? "flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#2e8b5a] border-b-2 border-[#2e8b5a] bg-[#f0faf4] transition-all"
    : "flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-400 hover:text-gray-600 transition-all";

  const statusBadge = (order: Order) => {
    if (order.escrow_status === "released") return "bg-green-100 text-[#2e8b5a]";
    if (order.escrow_status === "holding") return "bg-purple-100 text-purple-700";
    if (order.status === "pending") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
  };

  const statusLabel = (order: Order) => {
    if (order.escrow_status === "released") return "Completed";
    if (order.escrow_status === "holding") return "Funds in Escrow";
    if (order.status === "pending") return "Awaiting Payment";
    return order.status;
  };

  const progressWidth = (order: Order) => {
    if (order.escrow_status === "released") return "100%";
    if (order.escrow_status === "holding") return "60%";
    if (order.status === "pending") return "20%";
    return "0%";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading escrow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">
      {/* Flutterwave inline checkout script */}
      <Script src="https://checkout.flutterwave.com/v3.js" strategy="afterInteractive" />

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2e8b5a] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-bold text-[#1a4731]">Kora</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/dashboard" className="text-xs sm:text-sm text-gray-600 hover:text-[#2e8b5a] font-medium transition">
              Dashboard
            </a>
            <a href="/" className="text-xs sm:text-sm text-gray-600 hover:text-[#2e8b5a] font-medium transition">
              Marketplace
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 sm:mb-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white opacity-5 rounded-full translate-x-10 sm:translate-x-16 -translate-y-10 sm:-translate-y-16 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-green-200 text-xs sm:text-sm font-semibold uppercase tracking-wide">Secure Escrow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Escrow Payments</h1>
            <p className="text-green-100 text-xs sm:text-sm max-w-lg">
              Every order paid through Kora is held securely until you confirm delivery — then funds are released to the seller.
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6">
              {[
                { step: "1", label: "Buyer Pays Securely" },
                { step: "2", label: "Funds Held in Escrow" },
                { step: "3", label: "Buyer Confirms — Funds Released" },
              ].map((s) => (
                <div key={s.step} className="bg-white/10 rounded-xl p-2.5 sm:p-3 text-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2 text-[11px] sm:text-xs font-bold">
                    {s.step}
                  </div>
                  <p className="text-[10px] sm:text-xs text-green-100 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Escrow Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#1a4731]">{orders.length}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">Total Orders</div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {orders.filter((o) => o.escrow_status === "holding").length}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">In Escrow</div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#2e8b5a]">
              {orders.filter((o) => o.escrow_status === "released").length}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">Completed</div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button type="button" onClick={() => switchTab("buyer")} className={buyerTabClass}>
              My Purchases
            </button>
            <button type="button" onClick={() => switchTab("seller")} className={sellerTabClass}>
              My Sales
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#f0faf4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-1">No orders yet</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-6 px-4">
                  {activeTab === "buyer" ? "Browse the marketplace and place your first order." : "Orders buyers pay for will appear here."}
                </p>
                <a href="/" className="bg-[#2e8b5a] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#1a4731] transition inline-block">
                  Go to Marketplace
                </a>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:shadow-sm transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                            {order.product_name || order.productName || "Order"}
                          </h3>
                          <span className={"px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold " + statusBadge(order)}>
                            {statusLabel(order)}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                          {activeTab === "buyer" ? (
                            <p className="truncate">Seller: <span className="font-medium text-gray-700">{order.seller}</span></p>
                          ) : (
                            <p className="truncate">Buyer: <span className="font-medium text-gray-700">{order.buyer}</span></p>
                          )}
                          {order.amount && (
                            <p className="truncate">Amount: <span className="font-medium text-gray-700">₦{Number(order.amount).toLocaleString()}</span></p>
                          )}
                        </div>

                        {/* Escrow progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400 mb-1">
                            <span>Paid</span>
                            <div className="flex-1 h-1 bg-gray-100 rounded-full">
                              <div
                                className="h-1 bg-[#2e8b5a] rounded-full transition-all"
                                style={{ width: progressWidth(order) }}
                              />
                            </div>
                            <span className={order.escrow_status === "released" ? "text-[#2e8b5a] font-semibold" : ""}>Released</span>
                          </div>
                        </div>
                      </div>

                      {/* Action: buyer pays for pending order */}
                      {activeTab === "buyer" && order.status === "pending" && (
                        <button
                          onClick={() => handlePayNow(order)}
                          disabled={payingId === order.id}
                          className="w-full md:w-auto bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap"
                        >
                          {payingId === order.id ? "Opening payment..." : "Pay Now"}
                        </button>
                      )}

                      {/* Action: buyer confirms delivery to release funds */}
                      {activeTab === "buyer" && order.escrow_status === "holding" && (
                        <button
                          onClick={() => handleConfirmDelivery(order)}
                          disabled={confirmingId === order.id}
                          className="w-full md:w-auto bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap"
                        >
                          {confirmingId === order.id ? "Confirming..." : "Confirm Delivery"}
                        </button>
                      )}

                      {activeTab === "seller" && order.escrow_status === "holding" && (
                        <div className="w-full md:w-auto text-center bg-[#f0faf4] border border-[#c8e6d4] text-[#2e8b5a] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold">
                          Awaiting Delivery Confirmation
                        </div>
                      )}

                      {order.escrow_status === "released" && (
                        <div className="w-full md:w-auto text-center bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold">
                          Funds Released
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

      <div className="text-center py-6 sm:py-8 text-xs text-gray-400 mt-6 sm:mt-10">
        2025 Kora Marketplace · Secure Escrow Payments
      </div>
    </div>
  );
}