"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getOrdersByBuyer, getSellerProfile } from "@/lib/storage";
import Link from "next/link";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Eye,
  Trash2,
  Calendar,
  Banknote,
  X,
} from "lucide-react";

type SellerProfile = {
  email?: string;
  business_name?: string;
  logo_url?: string;
  is_verified?: boolean;
};

// ── Status → brand-consistent styling ────────────────────────────────────
// Orange is the primary brand color and is used for every "in progress"
// state so the whole flow reads as one design system. Green is reserved
// for a genuinely completed/successful outcome (delivered). Red is
// reserved for a negative outcome (rejected). Gray is neutral (pending,
// nothing happening yet).
const STATUS_STYLES: Record<string, { classes: string; Icon: typeof Package; label?: string }> = {
  delivered: { classes: "bg-green-50 text-green-700 border border-green-200", Icon: CheckCircle2 },
  in_transit: { classes: "bg-[#FFF3E8] text-[#c2410c] border border-[#FDBA8C]", Icon: Truck },
  accepted: { classes: "bg-[#FFF3E8] text-[#c2410c] border border-[#FDBA8C]", Icon: Truck },
  processing: { classes: "bg-[#FFF3E8] text-[#c2410c] border border-[#FDBA8C]", Icon: Clock },
  pending: { classes: "bg-gray-100 text-gray-600 border border-gray-200", Icon: Clock },
  rejected: { classes: "bg-red-50 text-red-700 border border-red-200", Icon: XCircle },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] || { classes: "bg-gray-100 text-gray-600 border border-gray-200", Icon: Package };
}

// ── Order deletion eligibility ───────────────────────────────────────────
// An order can be deleted if it has no transaction attached, or if its
// transaction was cancelled/failed/is no longer active. It cannot be
// deleted while a transaction is pending, processing, or completed.
function canDeleteOrder(order: any): boolean {
  const txStatus = (order.transaction_status || order.transactionStatus || "").toString().toLowerCase().trim();

  if (!txStatus) return true; // no transaction attached at all

  const blocked = ["pending", "processing", "completed", "success", "successful"];
  if (blocked.includes(txStatus)) return false;

  const allowed = ["cancelled", "canceled", "failed", "inactive", "expired"];
  if (allowed.includes(txStatus)) return true;

  // Unrecognized status — be conservative and don't allow deletion.
  return false;
}

// The real product photo, pulled from the product record on the order
// (falls back through a couple of possible field names depending on how
// the order was created/joined), never an emoji or generic icon unless
// the product genuinely has no uploaded image.
function getProductImage(order: any): string | null {
  return (
    order.product_image ||
    order.productImage ||
    order.product?.image_url ||
    order.product?.image ||
    order.image ||
    null
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [sellerProfiles, setSellerProfiles] = useState<Record<string, SellerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/auth/login"; return; }
      setUser(data.user);
      try {
        const myOrders = await getOrdersByBuyer(data.user.email || "");
        const list = Array.isArray(myOrders) ? myOrders : [];
        setOrders(list);

        // Load each unique seller's real profile (business name + avatar)
        // so we can identify sellers without ever showing an email.
        const uniqueSellers = Array.from(new Set(list.map((o) => o.seller).filter(Boolean)));
        const profiles: Record<string, SellerProfile> = {};
        await Promise.all(
          uniqueSellers.map(async (sellerKey) => {
            try {
              const profile = await getSellerProfile(sellerKey);
              if (profile) profiles[sellerKey] = profile;
            } catch (err) {
              console.error("Failed to load seller profile for", sellerKey, err);
            }
          })
        );
        setSellerProfiles(profiles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const sellerName = sellerProfiles[order.seller]?.business_name || order.seller || "";
    const matchesSearch =
      (order.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.product_name || order.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    accepted: orders.filter(o => o.status === "accepted" || o.status === "in_transit").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  async function confirmDelete() {
    if (!orderToDelete?.id) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("orders").delete().eq("id", orderToDelete.id);
      if (error) throw error;
      setOrders((current) => current.filter((o) => o.id !== orderToDelete.id));
      if (selectedOrder?.id === orderToDelete.id) setSelectedOrder(null);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all your purchases</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total, color: "text-gray-800", border: "border-gray-100" },
            { label: "Pending", value: stats.pending, color: "text-[#F97316]", border: "border-[#FDBA8C]/60" },
            { label: "In Progress", value: stats.accepted, color: "text-[#F97316]", border: "border-[#FDBA8C]/60" },
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
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316] cursor-pointer">
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
            <Package className="w-12 h-12 text-[#F97316] mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="font-black text-gray-700 mb-2">
              {orders.length === 0 ? "No orders yet" : "No orders match your search"}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {orders.length === 0 ? "Browse suppliers and place your first order" : "Try adjusting your search or filter"}
            </p>
            {orders.length === 0 && (
              <Link href="/marketplace" className="bg-[#F97316] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#c2410c] transition">
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
              const { classes: statusClasses, Icon: StatusIcon } = getStatusStyle(status);
              const sellerProfile = sellerProfiles[order.seller];
              const sellerName = sellerProfile?.business_name || order.seller || "Unknown Supplier";
              const deletable = canDeleteOrder(order);
              const productImage = getProductImage(order);

              return (
                <div key={order.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Product image — real product photo, icon only as last resort */}
                    <div className="w-16 h-16 bg-[#FFF3E8] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#FDBA8C]/40">
                      {productImage ? (
                        <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-[#F97316]" strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-black text-gray-800">{productName}</h3>

                          {/* Seller identity — business name + avatar, never an email */}
                          <div className="flex items-center gap-2 mt-1">
                            {sellerProfile?.logo_url ? (
                              <img src={sellerProfile.logo_url} alt={sellerName} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {sellerName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <p className="text-sm text-gray-500 truncate">{sellerName}</p>
                            {sellerProfile?.is_verified && (
                              <span className="text-[10px] font-bold text-[#F97316] bg-[#FFF3E8] px-1.5 py-0.5 rounded-full flex-shrink-0">
                                Verified
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                            {order.quantity && (
                              <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {order.quantity}</span>
                            )}
                            {order.price && (
                              <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" /> {order.price}</span>
                            )}
                            {order.created_at && (
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold " + statusClasses}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                          </span>
                          <span className="text-xs text-gray-400 font-mono hidden md:block">{orderId.slice(0, 12)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <Link href="/message" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#F97316] bg-[#FFF3E8] hover:bg-[#F97316] hover:text-white rounded-lg transition">
                      <MessageCircle className="w-3.5 h-3.5" /> Contact Supplier
                    </Link>
                    <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                    {deletable && (
                      <button onClick={e => { e.stopPropagation(); setOrderToDelete(order); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Order detail modal ── */}
      {selectedOrder && (() => {
        const detailImage = getProductImage(selectedOrder);
        const { classes: detailStatusClasses, Icon: DetailStatusIcon } = getStatusStyle(selectedOrder.status || "pending");
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Order Details</h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {detailImage ? (
                  <img src={detailImage} alt="" className="w-full h-40 object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-40 bg-[#FFF3E8] rounded-xl flex items-center justify-center border border-[#FDBA8C]/40">
                    <Package className="w-8 h-8 text-[#F97316]" strokeWidth={1.5} />
                  </div>
                )}

                <div className="bg-[#FFF3E8] rounded-xl p-4 space-y-3">
                  {[
                    ["Product", selectedOrder.product_name || selectedOrder.productName || "—"],
                    ["Supplier", sellerProfiles[selectedOrder.seller]?.business_name || selectedOrder.seller || "—"],
                    ["Quantity", selectedOrder.quantity || "—"],
                    ["Price", selectedOrder.price || "—"],
                    ["Date", selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
                      <span className="text-sm font-bold text-gray-800">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</span>
                    <span className={"flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold " + detailStatusClasses}>
                      <DetailStatusIcon className="w-3.5 h-3.5" />
                      {(selectedOrder.status || "pending").charAt(0).toUpperCase() + (selectedOrder.status || "pending").slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/message"
                    className="flex items-center justify-center gap-2 bg-[#F97316] text-white py-3 rounded-xl font-black text-sm hover:bg-[#c2410c] transition">
                    <MessageCircle className="w-4 h-4" /> Message Supplier
                  </Link>
                  <button onClick={() => setSelectedOrder(null)}
                    className="border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                    Close
                  </button>
                </div>

                {canDeleteOrder(selectedOrder) && (
                  <button
                    onClick={() => setOrderToDelete(selectedOrder)}
                    className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 py-3 rounded-xl font-bold text-sm transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Order
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete confirmation dialog ── */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => !deleting && setOrderToDelete(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-900 text-lg mb-2">Delete this order?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the order for "{orderToDelete.product_name || orderToDelete.productName || "this product"}". This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                disabled={deleting}
                className="border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-xl font-bold text-sm transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}