"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getOrdersByBuyer } from "@/lib/storage";
import Link from "next/link";

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800 border border-green-200";
    case "in_transit": return "bg-blue-100 text-blue-800 border border-blue-200";
    case "processing": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "accepted": return "bg-blue-100 text-blue-800 border border-blue-200";
    case "pending": return "bg-gray-100 text-gray-700 border border-gray-200";
    case "rejected": return "bg-red-100 text-red-700 border border-red-200";
    default: return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered": return "✅";
    case "in_transit": return "🚚";
    case "accepted": return "🚚";
    case "processing": return "⏳";
    case "pending": return "🕐";
    case "rejected": return "❌";
    default: return "📦";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/auth/login"; return; }
      setUser(data.user);
      try {
        const myOrders = await getOrdersByBuyer(data.user.email || "");
        setOrders(Array.isArray(myOrders) ? myOrders : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      (order.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.product_name || order.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.seller || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    accepted: orders.filter(o => o.status === "accepted" || o.status === "in_transit").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#1a4731]">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all your purchases</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total, color: "text-gray-800", border: "border-gray-100" },
            { label: "Pending", value: stats.pending, color: "text-amber-600", border: "border-amber-100" },
            { label: "In Progress", value: stats.accepted, color: "text-blue-600", border: "border-blue-100" },
            { label: "Delivered", value: stats.delivered, color: "text-green-600", border: "border-green-100" },
          ].map(s => (
            <div key={s.label} className={"bg-white rounded-2xl p-5 shadow-sm border " + s.border}>
              <p className={"text-3xl font-black " + s.color}>{s.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by product name, supplier..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2e8b5a] focus:ring-2 focus:ring-[#2e8b5a]/10"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2e8b5a] cursor-pointer">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-black text-gray-700 mb-2">
              {orders.length === 0 ? "No orders yet" : "No orders match your search"}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {orders.length === 0 ? "Browse suppliers and place your first order" : "Try adjusting your search or filter"}
            </p>
            {orders.length === 0 && (
              <Link href="/marketplace" className="bg-[#2e8b5a] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#1a4731] transition">
                Browse Suppliers
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const productName = order.product_name || order.productName || "Unknown Product";
              const orderId = order.id || "—";
              const status = order.status || "pending";
              return (
                <div key={order.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-[#f0faf4] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {order.image ? <img src={order.image} alt={productName} className="w-full h-full object-cover rounded-xl"/> : "📦"}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-black text-gray-800">{productName}</h3>
                          <p className="text-sm text-gray-500">Supplier: {order.seller || "—"}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                            {order.quantity && <span>📦 {order.quantity}</span>}
                            {order.price && <span>💰 {order.price}</span>}
                            {order.created_at && <span>📅 {new Date(order.created_at).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold " + getStatusColor(status)}>
                            {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                          </span>
                          <span className="text-xs text-gray-400 font-mono hidden md:block">{orderId.slice(0, 12)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <Link href="/message" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2e8b5a] bg-[#f0faf4] hover:bg-[#2e8b5a] hover:text-white rounded-lg transition">
                      💬 Contact Supplier
                    </Link>
                    <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                      👁 View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Order detail modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
              <div>
                <h2 className="font-black text-[#1a4731] text-lg">Order Details</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#f0faf4] rounded-xl p-4 space-y-3">
                {[
                  ["Product", selectedOrder.product_name || selectedOrder.productName || "—"],
                  ["Supplier", selectedOrder.seller || "—"],
                  ["Quantity", selectedOrder.quantity || "—"],
                  ["Price", selectedOrder.price || "—"],
                  ["Date", selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : "—"],
                  ["Status", (selectedOrder.status || "pending").charAt(0).toUpperCase() + (selectedOrder.status || "pending").slice(1)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
                    <span className="text-sm font-bold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/message"
                  className="flex items-center justify-center gap-2 bg-[#2e8b5a] text-white py-3 rounded-xl font-black text-sm hover:bg-[#1a4731] transition">
                  💬 Message Supplier
                </Link>
                <button onClick={() => setSelectedOrder(null)}
                  className="border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}