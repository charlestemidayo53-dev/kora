"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getProductById, submitInquiry, getSellerProfile, addOrder } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

type Product = {
  id?: string;
  name: string;
  price: string;
  location: string;
  quantity: string;
  image?: string;
  category: string;
  subcategory?: string;
  seller: string;
  owner: string;
  state?: string;
  city?: string;
  description?: string;
  is_verified?: boolean;
  unit?: string;
  created_at?: string;
};

type SellerProfile = {
  email: string;
  business_name?: string;
  phone?: string;
  state?: string;
  city?: string;
  is_verified?: boolean;
  verification_badge?: string;
  rating?: number;
  total_sales?: number;
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryQty, setInquiryQty] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      async function load() {
        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) setUser(data.user);

          const prod = await getProductById(id);
          if (!prod) {
            router.push("/marketplace");
            return;
          }
          setProduct(prod);

          const sellerData = await getSellerProfile(prod.owner);
          if (sellerData) setSeller(sellerData);
        } catch (err) {
          console.error("Error loading product detail:", err);
        } finally {
          setLoading(false);
        }
      }

      if (id) {
        load();
      }
    },
    [id, router],
  );

  async function handleInquiry() {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!inquiryQty) {
      setError("Please enter the quantity you need.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitInquiry({
        product_id: product?.id || "",
        buyer_email: user.email,
        seller_email: product?.owner || "",
        quantity: inquiryQty,
        message: inquiryMsg,
        status: "pending",
      });
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBuy() {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!product) return;
    setBuying(true);
    try {
      await addOrder({
        productName: product.name,
        buyer: user.email,
        seller: product.seller || product.owner,
        status: "pending",
      });
      alert("Order placed successfully! The seller will contact you.");
      router.push("/orders");
    } catch (err) {
      alert("Failed to place order. Please try again.");
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const sellerInitial = (product.seller || product.owner || "S").charAt(0).toUpperCase();
  const formattedDate = product.created_at
    ? new Date(product.created_at).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const inputClass =
    "w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2e8b5a] transition";
  const browseClass =
    "w-full bg-[#f0faf4] border border-[#c8e6d4] text-[#2e8b5a] hover:bg-[#2e8b5a] hover:text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2";
  const escrowClass =
    "w-full bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2";
  const signInClass =
    "block w-full text-center border border-[#2e8b5a] text-[#2e8b5a] hover:bg-[#f0faf4] py-3.5 rounded-xl font-semibold text-sm transition";

  return (
    <div className="min-h-screen bg-[#f0faf4]">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={function () {
                router.back();
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-[#2e8b5a] transition text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className="text-gray-300">|</span>
            <a href="/marketplace" className="text-sm text-gray-500 hover:text-[#2e8b5a] transition">
              Marketplace
            </a>
          </div>
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-base font-bold text-[#1a4731]">Kora</span>
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-80 bg-[#f0faf4] relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">No image uploaded</span>
                  </div>
                )}

                {product.is_verified && (
                  <div className="absolute top-4 right-4 bg-[#2e8b5a] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified Product
                  </div>
                )}

                <div className="absolute top-4 left-4 bg-[#1a4731] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {product.category}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-2xl font-black text-gray-900">{product.name}</h1>
                  <p className="text-2xl font-black text-[#2e8b5a] ml-4 flex-shrink-0">
                    N{product.price}
                  </p>
                </div>

                {product.subcategory && (
                  <span className="inline-block bg-[#f0faf4] text-[#2e8b5a] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {product.subcategory}
                  </span>
                )}

                {product.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {product.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#f0faf4] rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Available Quantity</p>
                    <p className="font-bold text-[#1a4731]">
                      {product.quantity} {product.unit || ""}
                    </p>
                  </div>
                  <div className="bg-[#f0faf4] rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Price</p>
                    <p className="font-bold text-[#1a4731]">
                      N{product.price} {product.unit ? "/ " + product.unit : ""}
                    </p>
                  </div>
                  <div className="bg-[#f0faf4] rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Location</p>
                    <p className="font-bold text-[#1a4731]">
                      {product.city ? product.city + ", " : ""}
                      {product.state || product.location}
                    </p>
                  </div>
                  <div className="bg-[#f0faf4] rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Category</p>
                    <p className="font-bold text-[#1a4731]">{product.category}</p>
                  </div>
                </div>

                {formattedDate && (
                  <p className="text-xs text-gray-400 mt-4">Listed on {formattedDate}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Send an Inquiry</h2>
              <p className="text-gray-500 text-sm mb-5">
                Contact the seller directly about this product
              </p>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-[#f0faf4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">Inquiry Sent!</h3>
                  <p className="text-gray-500 text-sm">
                    The seller will contact you soon via email.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Needed
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500 kg"
                      value={inquiryQty}
                      onChange={function (e) {
                        setInquiryQty(e.target.value);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message to Seller (optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. I need delivery to Lagos, is that possible?"
                      value={inquiryMsg}
                      onChange={function (e) {
                        setInquiryMsg(e.target.value);
                      }}
                      className={inputClass + " resize-none"}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {!user && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
                      You need to sign in to send an inquiry.
                    </div>
                  )}

                  <button
                    onClick={handleInquiry}
                    disabled={submitting}
                    className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-md"
                  >
                    {submitting ? "Sending Inquiry..." : "Send Inquiry to Seller"}
                  </button>

                  {!user && (
                    <a href="/auth/login" className={signInClass}>
                      Sign In to Contact Seller
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Seller Information
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#2e8b5a] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">
                    {sellerInitial}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {seller?.business_name || product.seller || product.owner}
                  </p>
                  <p className="text-xs text-gray-500">{product.owner}</p>
                </div>
              </div>

              {seller?.is_verified ? (
                <div className="flex items-center gap-2 bg-[#f0faf4] border border-[#c8e6d4] px-4 py-2.5 rounded-xl mb-4">
                  <svg className="w-4 h-4 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs font-bold text-[#2e8b5a]">Verified Seller</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl mb-4">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500">Unverified Seller</span>
                </div>
              )}

              <div className="space-y-2 text-sm">
                {seller?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{seller.phone}</span>
                  </div>
                )}
                {(seller?.state || seller?.city) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {seller.city ? seller.city + ", " : ""}
                      {seller.state}
                    </span>
                  </div>
                )}
                {seller?.rating && seller.rating > 0 ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{seller.rating} rating</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {buying ? "Placing Order..." : "Buy Now"}
                </button>

                <a href="/marketplace" className={browseClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 014 0z" />
                  </svg>
                  Browse More Products
                </a>

                <a href="/escrow" className={escrowClass}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pay via Escrow
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Buyer Protection
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                    label: "Escrow Payment Protection",
                  },
                  {
                    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                    label: "Secure Transactions",
                  },
                  {
                    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                    label: "Direct Seller Contact",
                  },
                ].map(function (badge, i) {
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#f0faf4] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        2025 Kora Marketplace - Empowering Nigerian Agriculture
      </div>
    </div>
  );
}
