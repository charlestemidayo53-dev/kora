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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-[2px] border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header - Reduced size and thickness */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] mb-1">Shopping Cart</h1>
            <p className="text-sm text-[#6B7280]">
              {items.length} item{items.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-[#DC2626] hover:text-[#B91C1C] transition uppercase tracking-wider"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] py-16 text-center">
            {/* Reduced Cart Icon size and thickness */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E5E7EB]">
              <svg className="w-6 h-6 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#111827] mb-1">Your cart is empty</h3>
            <p className="text-sm text-[#6B7280] mb-8">Browse the marketplace to find products for your business.</p>
            <Link
              href="/marketplace"
              className="inline-block bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-3 rounded-lg font-bold text-sm transition shadow-sm hover:shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">

            {/* Cart items grouped by seller */}
            <div className="space-y-8">
              {Object.entries(groupedBySeller).map(function ([sellerName, sellerItems]) {
                const sellerSubtotal = sellerItems.reduce(function (s, it) {
                  return s + it.price * it.quantity;
                }, 0);

                return (
                  <div key={sellerName} className="border-t border-[#E5E7EB] pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#6B7280]">Supplier: {sellerName}</h2>
                      <span className="text-[10px] font-bold text-[#F97316] bg-[#FFF7ED] px-2 py-1 rounded uppercase">
                        {sellerItems.length} item{sellerItems.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-8">
                      {sellerItems.map(function (item) {
                        return (
                          <div key={item.id} className="flex gap-6">
                            {/* Product Image */}
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F9FAFB] border border-[#E5E7EB] flex-shrink-0">
                              {item.product_image ? (
                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-[#E5E7EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                              <div>
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-bold text-[#111827]">{item.product_name}</h4>
                                  <p className="text-sm font-black text-[#111827]">
                                    ₦{(item.price * item.quantity).toLocaleString("en-NG")}
                                  </p>
                                </div>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  ₦{Number(item.price).toLocaleString("en-NG")}{item.unit ? " / " + item.unit : ""}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-4">
                                {/* Quantity stepper - Reduced size */}
                                <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-white overflow-hidden">
                                  <button
                                    onClick={function () { updateQuantity(item.id, item.quantity - 1); }}
                                    disabled={updating === item.id || item.quantity <= 1}
                                    className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#F97316] hover:bg-[#F9FAFB] disabled:opacity-30 transition"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="w-8 text-center text-xs font-bold text-[#111827]">{item.quantity}</span>
                                  <button
                                    onClick={function () { updateQuantity(item.id, item.quantity + 1); }}
                                    disabled={updating === item.id}
                                    className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#F97316] hover:bg-[#F9FAFB] transition"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>

                                <button
                                  onClick={function () { removeItem(item.id); }}
                                  className="text-xs font-bold text-[#6B7280] hover:text-[#DC2626] transition uppercase tracking-wider"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex justify-between items-center">
                      <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Supplier Subtotal</span>
                      <span className="text-sm font-black text-[#111827]">₦{sellerSubtotal.toLocaleString("en-NG")}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary - Refined spacing */}
            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 sticky top-28">
              <h2 className="text-lg font-bold text-[#111827] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#6B7280] uppercase tracking-wider">Items Subtotal</span>
                  <span className="text-[#111827]">₦{subtotal.toLocaleString("en-NG")}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#6B7280] uppercase tracking-wider">Total Suppliers</span>
                  <span className="text-[#111827]">{Object.keys(groupedBySeller).length}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#6B7280] uppercase tracking-wider">Shipping</span>
                  <span className="text-[#16A34A] uppercase tracking-wider">At Checkout</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E7EB] mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-[#111827] text-xs font-black uppercase tracking-widest">Total</span>
                  <span className="text-xl font-black text-[#F97316]">₦{subtotal.toLocaleString("en-NG")}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center bg-[#F97316] hover:bg-[#EA580C] text-white py-4 rounded-lg font-bold text-sm transition shadow-sm hover:shadow-md mb-4"
              >
                Checkout Now
              </Link>
              
              <Link
                href="/marketplace"
                className="block w-full text-center text-[#6B7280] hover:text-[#111827] py-2 text-xs font-bold uppercase tracking-widest transition"
              >
                Continue Shopping
              </Link>

              <div className="mt-8 p-4 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-[#FFF7ED] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-[#6B7280] leading-relaxed uppercase tracking-tight">
                    <span className="text-[#111827]">Kora Escrow.</span> Secure payment until delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
