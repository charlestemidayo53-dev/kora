"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getCatalogueProductById, submitCatalogueProductRequest } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

type CatalogueProduct = {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  description?: string;
  estimated_market_price?: number;
};

function formatNaira(price: number | undefined): string {
  if (price === undefined || price === null) return "N/A";
  return "N" + price.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function CatalogueProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [product, setProduct] = useState<CatalogueProduct | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  useEffect(function () {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);

      const p = await getCatalogueProductById(id);
      if (!p) {
        router.push("/");
        return;
      }
      setProduct(p);
      setLoading(false);
    }
    if (id) load();
  }, [id, router]);

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!product || !quantity) return;

    setSubmitting(true);
    try {
      await submitCatalogueProductRequest({
        catalogueProductId: product.id,
        buyer: user.email,
        quantity,
        location: location || undefined,
        message: message || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit request:", err);
      alert("Something went wrong submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6]">
        <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#f5f7f6] pb-16">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={function () { router.back(); }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#F97316] transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="inline-block bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            Not yet stocked by a seller — request only
          </div>

          <h1 className="text-xl font-black text-gray-900">{product.name}</h1>
          {product.category && (
            <span className="inline-block bg-[#FFF3E8] text-[#F97316] text-xs font-semibold px-3 py-1 rounded-full mt-3">
              {product.category}
            </span>
          )}

          <p className="text-2xl font-black text-[#F97316] mt-4">
            Est. {formatNaira(product.estimated_market_price)}
            {product.unit && <span className="text-sm text-gray-500 font-medium"> / {product.unit}</span>}
          </p>
          <p className="text-xs text-gray-400 mt-1">Estimated market price — not a live seller offer</p>

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed mt-4">{product.description}</p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-1">Request This Product</h2>
          <p className="text-xs text-gray-500 mb-4">
            No seller has this in stock yet. Submit a request and Kora will follow up to source it for you.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-2xl p-4">
              Request submitted. We'll be in touch once we've sourced this product.
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Quantity needed *</label>
                <input
                  value={quantity}
                  onChange={function (e) { setQuantity(e.target.value); }}
                  required
                  placeholder={"e.g. 500" + (product.unit ? " " + product.unit : "")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Delivery location</label>
                <input
                  value={location}
                  onChange={function (e) { setLocation(e.target.value); }}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Additional details</label>
                <textarea
                  value={message}
                  onChange={function (e) { setMessage(e.target.value); }}
                  rows={3}
                  placeholder="Any specifications, grade, or delivery timing"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#F97316] hover:bg-[#ea6a0c] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
