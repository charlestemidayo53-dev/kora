"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type CartItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  price: number;
  unit?: string;
  quantity: number;
  seller?: string;
  owner?: string;
};

export default function CartPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(data.user);
      await loadCart(data.user.email);
    }
    init();
  }, []);

  async function loadCart(email: string) {
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function updateQuantity(itemId: string, newQty: number) {
    if (newQty < 1) return;
    setUpdating(itemId);
    await supabase.from("cart_items").update({ quantity: newQty }).eq("id", itemId);
    setItems(function (prev) {
      return prev.map(function (it) {
        return it.id === itemId ? { ...it, quantity: newQty } : it;
      });
    });
    setUpdating(null);
  }

  async function removeItem(itemId: string) {
    await supabase.from("cart_items").delete().eq("id", itemId);
    setItems(function (prev) {
      return prev.filter(function (it) { return it.id !== itemId; });
    });
  }

  async function clearCart() {
    if (!confirm("Remove all items from your cart?")) return;
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_email", user.email);
    setItems([]);
  }

  const subtotal = items.reduce(function (sum, it) {
    return sum + it.price * it.quantity;
  }, 0);

  // Group items by seller — useful for B2B since orders go per-supplier
  const groupedBySeller: { [key: string]: CartItem[] } = {};
  items.forEach(function (it) {
    const key = it.seller || it.owner || "Unknown Seller";
    if (!groupedBySeller[key]) groupedBySeller[key] = [];
    groupedBySeller[key].push(it);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4] py-8 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#1a4731]">Shopping Cart</h1>
            <p className="text-sm text-gray-500">
              {items.length} item{items.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <p className="font-black text-gray-700 mb-1">Your cart is empty</p>
            <p className="text-sm text-gray-400 mb-6">Browse the marketplace to add products</p>
            <Link
              href="/marketplace"
              className="inline-block bg-[#2e8b5a] hover:bg-[#1a4731] text-white px-6 py-3 rounded-xl font-black text-sm transition"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">

            {/* Cart items grouped by seller */}
            <div className="space-y-6">
              {Object.entries(groupedBySeller).map(function ([sellerName, sellerItems]) {
                const sellerSubtotal = sellerItems.reduce(function (s, it) {
                  return s + it.price * it.quantity;
                }, 0);

                return (
                  <div key={sellerName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-[#f8faf8] border-b border-gray-100 flex items-center justify-between">
                      <p className="text-sm font-black text-gray-700">{sellerName}</p>
                      <p className="text-xs text-gray-400">
                        {sellerItems.length} item{sellerItems.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {sellerItems.map(function (item) {
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-5">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f0faf4] flex-shrink-0">
                              {item.product_image ? (
                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-[#2e8b5a] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M9 21V9" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-800 truncate">{item.product_name}</p>
                              <p className="text-xs text-gray-400">
                                N{Number(item.price).toLocaleString("en-NG")}{item.unit ? " / " + item.unit : ""}
                              </p>
                            </div>

                            {/* Quantity stepper */}
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                              <button
                                onClick={function () { updateQuantity(item.id, item.quantity - 1); }}
                                disabled={updating === item.id || item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#2e8b5a] disabled:opacity-30 transition"
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                              <button
                                onClick={function () { updateQuantity(item.id, item.quantity + 1); }}
                                disabled={updating === item.id}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#2e8b5a] transition"
                              >
                                +
                              </button>
                            </div>

                            <p className="text-sm font-black text-[#2e8b5a] w-24 text-right flex-shrink-0">
                              N{(item.price * item.quantity).toLocaleString("en-NG")}
                            </p>

                            <button
                              onClick={function () { removeItem(item.id); }}
                              className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-5 py-3 bg-[#f8faf8] border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400">Subtotal from {sellerName}</p>
                      <p className="text-sm font-black text-[#1a4731]">
                        N{sellerSubtotal.toLocaleString("en-NG")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
              <h2 className="font-black text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-700">N{subtotal.toLocaleString("en-NG")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Suppliers</span>
                  <span className="font-bold text-gray-700">{Object.keys(groupedBySeller).length}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-black text-gray-800">Total</span>
                <span className="font-black text-[#2e8b5a] text-xl">N{subtotal.toLocaleString("en-NG")}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center bg-[#2e8b5a] hover:bg-[#1a4731] text-white py-3.5 rounded-xl font-black text-sm transition mb-3"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/marketplace"
                className="block w-full text-center border border-gray-200 text-gray-600 hover:border-[#2e8b5a] hover:text-[#2e8b5a] py-3 rounded-xl font-bold text-sm transition"
              >
                Continue Shopping
              </Link>

              <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
                Orders are placed separately per supplier. Payments are protected by Kora Escrow.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}