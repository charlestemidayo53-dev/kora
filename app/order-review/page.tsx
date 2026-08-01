"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { getProductById } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

type Product = {
  id?: string;
  name: string;
  price: string;
  location?: string;
  quantity?: string;
  unit?: string;
  image?: string;
  category?: string;
  seller?: string;
  owner: string;
};

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => void;
  }
}

export default function OrderReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [flwReady, setFlwReady] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"awaiting_payment" | "verifying" | "paid" | "failed">("awaiting_payment");

  useEffect(function () {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);

      const prod = await getProductById(id);
      if (!prod) {
        router.push("/");
        return;
      }
      if (data.user.email === prod.owner) {
        alert("You cannot buy your own product.");
        router.push(`/product/${id}`);
        return;
      }
      setProduct(prod);
      setLoading(false);
    }
    if (id) load();
  }, [id, router]);

  const unitPrice = product ? Number(product.price) || 0 : 0;
  const total = unitPrice * qty;

  async function handlePayNow() {
    if (!product || !flwReady) return;
    setError("");
    setPaying(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        router.push("/auth/login");
        return;
      }

      const initRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, accessToken, quantity: qty }),
      });
      const initData = await initRes.json();

      if (!initRes.ok) {
        setError(initData.error || "Could not start payment.");
        setPaying(false);
        return;
      }

      setPaymentStatus("awaiting_payment");

      window.FlutterwaveCheckout?.({
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: initData.tx_ref,
        amount: initData.amount,
        currency: initData.currency,
        payment_options: "card, banktransfer, ussd",
        customer: {
          email: initData.customer.email,
          name: initData.customer.name,
        },
        customizations: {
          title: "Kora Marketplace",
          description: `Payment for ${product.name}`,
        },
        callback: async function (response: any) {
          setPaymentStatus("verifying");
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transaction_id: response.transaction_id }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              setPaymentStatus("failed");
              setError(verifyData.error || "Payment could not be verified.");
              setPaying(false);
              return;
            }

            setPaymentStatus("paid");
            setTimeout(function () {
              router.push("/orders");
            }, 1800);
          } catch (err) {
            setPaymentStatus("failed");
            setError("Payment verification failed. Please contact support if you were charged.");
            setPaying(false);
          }
        },
        onclose: function () {
          if (paymentStatus !== "paid") {
            setPaymentStatus("failed");
            setPaying(false);
          }
        },
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong starting payment. Please try again.");
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const statusLabel =
    paymentStatus === "paid" ? "Paid (Escrow)"
    : paymentStatus === "verifying" ? "Verifying Payment..."
    : paymentStatus === "failed" ? "Payment Failed — Awaiting Payment"
    : "Awaiting Payment";

  const statusColor =
    paymentStatus === "paid" ? "bg-green-100 text-green-700 border border-green-200"
    : paymentStatus === "verifying" ? "bg-blue-100 text-blue-700 border border-blue-200"
    : paymentStatus === "failed" ? "bg-red-100 text-red-700 border border-red-200"
    : "bg-amber-100 text-amber-700 border border-amber-200";

  return (
    <>
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        onLoad={() => setFlwReady(true)}
      />

      <div className="min-h-screen bg-[#f0faf4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2e8b5a] transition text-sm font-medium mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#1a4731]">Review Your Order</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Order Status: <span className="font-semibold text-gray-700">Pending Review</span></p>
              </div>
              <span className={"px-3 py-1.5 rounded-full text-xs font-bold " + statusColor}>
                {statusLabel}
              </span>
            </div>

            {/* Product summary */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 border-b border-gray-100">
              <div className="w-full sm:w-32 h-40 sm:h-32 bg-[#f0faf4] rounded-xl overflow-hidden flex-shrink-0">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-base sm:text-lg mb-1">{product.name}</h2>
                {product.category && (
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                )}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm text-gray-600">
                  <p>Seller: <span className="font-semibold text-gray-800">{product.seller || product.owner}</span></p>
                  <p>Buyer: <span className="font-semibold text-gray-800">{user?.email}</span></p>
                  {product.location && <p className="col-span-2">Delivery from: <span className="font-semibold text-gray-800">{product.location}</span></p>}
                </div>
              </div>
            </div>

            {/* Quantity + pricing */}
            <div className="p-5 sm:p-6 border-b border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Quantity {product.unit ? `(${product.unit})` : ""}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-gray-800">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Unit Price</span>
                <span className="font-semibold text-gray-800">₦{unitPrice.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-base font-bold text-gray-800">Total</span>
                <span className="text-xl sm:text-2xl font-black text-[#2e8b5a]">₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-5 sm:mx-6 mt-5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Pay Now */}
            <div className="p-5 sm:p-6">
              <button
                onClick={handlePayNow}
                disabled={paying || !flwReady || paymentStatus === "paid"}
                className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition shadow-md"
              >
                {paymentStatus === "paid"
                  ? "Payment Confirmed ✓"
                  : paymentStatus === "verifying"
                  ? "Verifying Payment..."
                  : paying
                  ? "Processing..."
                  : !flwReady
                  ? "Loading Payment Gateway..."
                  : `Pay Now — ₦${total.toLocaleString()}`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Your payment is processed securely by Flutterwave. Funds are held until delivery is confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}