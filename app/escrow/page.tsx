"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOrdersByBuyer, getOrdersBySeller, updateOrder } from "@/lib/storage";

type Order = {
  id?: string;
  productName: string;
  buyer: string;
  seller: string;
  status: "pending" | "accepted" | "rejected" | "paid" | "delivered" | "completed";
  amount?: string;
  escrow_status?: "holding" | "released" | "refunded" | null;
};

const stepClass = "flex items-center gap-3 p-4 rounded-xl border transition-all";

export default function EscrowPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "flutterwave">("paystack");
  const [amount, setAmount] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  function openPayModal(order: Order) {
    setSelectedOrder(order);
    setAmount("");
    setPaymentSuccess(false);
    setShowPayModal(true);
  }

  async function handleMockPayment() {
    if (!selectedOrder?.id || !amount) return;
    setPayingId(selectedOrder.id);

    await new Promise((res) => setTimeout(res, 2000));

    setPaymentSuccess(true);
    setPayingId(null);

    if (user?.email) await loadOrders(user.email, activeTab);
  }

  const buyerTabClass = activeTab === "buyer"
    ? "flex-1 py-3 text-sm font-semibold text-[#2e8b5a] border-b-2 border-[#2e8b5a] bg-[#f0faf4] transition-all"
    : "flex-1 py-3 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-all";

  const sellerTabClass = activeTab === "seller"
    ? "flex-1 py-3 text-sm font-semibold text-[#2e8b5a] border-b-2 border-[#2e8b5a] bg-[#f0faf4] transition-all"
    : "flex-1 py-3 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-all";

  const paystackClass = paymentMethod === "paystack"
    ? "flex items-center gap-3 p-4 rounded-xl border-2 border-[#2e8b5a] bg-[#f0faf4] cursor-pointer transition-all"
    : "flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all";

  const flutterwaveClass = paymentMethod === "flutterwave"
    ? "flex items-center gap-3 p-4 rounded-xl border-2 border-[#2e8b5a] bg-[#f0faf4] cursor-pointer transition-all"
    : "flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all";

  const statusBadge = (status: string) => {
    if (status === "pending") return "bg-amber-100 text-amber-700";
    if (status === "accepted") return "bg-blue-100 text-blue-700";
    if (status === "paid") return "bg-purple-100 text-purple-700";
    if (status === "delivered") return "bg-teal-100 text-teal-700";
    if (status === "completed") return "bg-green-100 text-[#2e8b5a]";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
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

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1a4731]">Kora</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-gray-600 hover:text-[#2e8b5a] font-medium transition">
              Dashboard
            </a>
            <a href="/marketplace" className="text-sm text-gray-600 hover:text-[#2e8b5a] font-medium transition">
              Marketplace
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full translate-x-16 -translate-y-16 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-green-200 text-sm font-semibold uppercase tracking-wide">Secure Escrow</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Escrow Payments</h1>
            <p className="text-green-100 text-sm max-w-lg">
              Your money is held securely until you confirm delivery. Protected by Kora's escrow system — pay via Paystack or Flutterwave.
            </p>

            {/* How it works steps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { step: "1", label: "Seller Accepts Order" },
                { step: "2", label: "Buyer Pays to Escrow" },
                { step: "3", label: "Seller Delivers Goods" },
                { step: "4", label: "Funds Released to Seller" },
              ].map((s) => (
                <div key={s.step} className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                    {s.step}
                  </div>
                  <p className="text-xs text-green-100">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Escrow Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#1a4731]">{orders.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total Orders</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {orders.filter((o) => o.status === "accepted").length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Awaiting Payment</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter((o) => o.status === "paid").length}
            </div>
            <div className="text-xs text-gray-500 mt-1">In Escrow</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#2e8b5a]">
              {orders.filter((o) => o.status === "completed").length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button type="button" onClick={() => switchTab("buyer")} className={buyerTabClass}>
              My Purchases
            </button>
            <button type="button" onClick={() => switchTab("seller")} className={sellerTabClass}>
              My Sales
            </button>
          </div>

          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#f0faf4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No orders yet</h3>
                <p className="text-gray-400 text-sm mb-6">
                  {activeTab === "buyer" ? "Browse the marketplace and place your first order." : "Your accepted orders will appear here."}
                </p>
                <a href="/marketplace" className="bg-[#2e8b5a] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#1a4731] transition inline-block">
                  Go to Marketplace
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-800">{order.productName}</h3>
                          <span className={"px-3 py-1 rounded-full text-xs font-semibold " + statusBadge(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          {activeTab === "buyer" ? (
                            <p>Seller: <span className="font-medium text-gray-700">{order.seller}</span></p>
                          ) : (
                            <p>Buyer: <span className="font-medium text-gray-700">{order.buyer}</span></p>
                          )}
                        </div>

                        {/* Escrow progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <span className={order.status !== "pending" ? "text-[#2e8b5a] font-semibold" : ""}>Accepted</span>
                            <div className="flex-1 h-1 bg-gray-100 rounded-full">
                              <div
                                className="h-1 bg-[#2e8b5a] rounded-full transition-all"
                                style={{
                                  width: order.status === "pending" ? "0%"
                                    : order.status === "accepted" ? "25%"
                                    : order.status === "paid" ? "50%"
                                    : order.status === "delivered" ? "75%"
                                    : order.status === "completed" ? "100%"
                                    : "0%"
                                }}
                              />
                            </div>
                            <span className={order.status === "completed" ? "text-[#2e8b5a] font-semibold" : ""}>Completed</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons — buyer only sees Pay button on accepted orders */}
                      {activeTab === "buyer" && order.status === "accepted" && (
                        <button
                          onClick={() => openPayModal(order)}
                          className="bg-[#2e8b5a] hover:bg-[#1a4731] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap"
                        >
                          Pay to Escrow
                        </button>
                      )}

                      {activeTab === "buyer" && order.status === "paid" && (
                        <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2.5 rounded-xl text-sm font-semibold">
                          Funds in Escrow
                        </div>
                      )}

                      {activeTab === "seller" && order.status === "paid" && (
                        <div className="bg-[#f0faf4] border border-[#c8e6d4] text-[#2e8b5a] px-4 py-2.5 rounded-xl text-sm font-semibold">
                          Awaiting Delivery Confirm
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

      {/* Payment Modal */}
      {showPayModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Pay to Escrow</h2>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-green-100 text-sm mt-1">
                {selectedOrder.productName}
              </p>
            </div>

            <div className="p-6">
              {paymentSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-[#f0faf4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Your funds are now held securely in escrow. They will be released to the seller once you confirm delivery.
                  </p>
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="bg-[#2e8b5a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1a4731] transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount (N)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2e8b5a] transition"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      <div onClick={() => setPaymentMethod("paystack")} className={paystackClass}>
                        <div className="w-10 h-10 bg-[#00c3f7] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-black text-xs">PS</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Paystack</p>
                          <p className="text-xs text-gray-500">Cards, bank transfer, USSD</p>
                        </div>
                        {paymentMethod === "paystack" && (
                          <div className="ml-auto w-5 h-5 bg-[#2e8b5a] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div onClick={() => setPaymentMethod("flutterwave")} className={flutterwaveClass}>
                        <div className="w-10 h-10 bg-[#f5a623] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-black text-xs">FW</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Flutterwave</p>
                          <p className="text-xs text-gray-500">Cards, mobile money, crypto</p>
                        </div>
                        {paymentMethod === "flutterwave" && (
                          <div className="ml-auto w-5 h-5 bg-[#2e8b5a] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Escrow notice */}
                  <div className="bg-[#f0faf4] border border-[#c8e6d4] rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#2e8b5a] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-[#1a4731] mb-1">Escrow Protection</p>
                        <p className="text-xs text-gray-600">
                          Your payment will be held securely by Kora until you confirm you have received your goods. You can request a refund if delivery fails.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handleMockPayment}
                    disabled={!amount || payingId === selectedOrder.id}
                    className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition"
                  >
                    {payingId === selectedOrder.id
                      ? "Processing Payment..."
                      : "Pay N" + (amount || "0") + " via " + (paymentMethod === "paystack" ? "Paystack" : "Flutterwave")}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    This is a demo payment. Real integration with {paymentMethod === "paystack" ? "Paystack" : "Flutterwave"} coming soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-center py-8 text-xs text-gray-400 mt-10">
        2025 Kora Marketplace · Secure Escrow Payments
      </div>
    </div>
  );
}