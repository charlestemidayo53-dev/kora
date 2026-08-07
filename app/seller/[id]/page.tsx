"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSellerProfile, getProducts } from "@/lib/storage";
import { ShieldCheck, MapPin, Calendar, Package, ArrowLeft } from "lucide-react";

type SellerProfile = {
  email?: string;
  business_name?: string;
  logo_url?: string;
  city?: string;
  state?: string;
  is_verified?: boolean;
  verification_badge?: string;
  rating?: number;
  years_on_kora?: number;
  response_rate?: number;
  description?: string;
  created_at?: string;
};

type Product = {
  id?: string;
  name: string;
  price: string;
  image?: string;
  owner: string;
};

function formatNaira(price: string | number | undefined): string {
  if (price === undefined || price === null || price === "") return "₦0";
  const numeric = typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, ""));
  if (isNaN(numeric)) return "₦" + price;
  return "₦" + numeric.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function SellerPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const sellerKey = decodeURIComponent(id);

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function load() {
      try {
        const profile = await getSellerProfile(sellerKey);
        setSeller(profile || null);

        const all = await getProducts();
        const sellerProducts = Array.isArray(all)
          ? all.filter(function (p: Product) { return p.owner === sellerKey; })
          : [];
        setProducts(sellerProducts);
      } catch (err) {
        console.error("Error loading seller profile:", err);
      } finally {
        setLoading(false);
      }
    }
    if (sellerKey) load();
  }, [sellerKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED]">
        <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED] px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Supplier profile not found.</p>
          <Link href="/marketplace" className="text-[#F97316] font-bold text-sm">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const displayName = seller.business_name || "Unnamed Supplier";
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = seller.created_at
    ? new Date(seller.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-[#FFF7ED] pb-16">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <button
            onClick={function () { router.back(); }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#F97316] transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            {seller.logo_url ? (
              <img src={seller.logo_url} alt={displayName} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 bg-[#F97316] rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-black">{initial}</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 truncate">{displayName}</h1>
              {(seller.city || seller.state) && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {seller.city ? seller.city + ", " : ""}{seller.state}
                </p>
              )}
              {memberSince && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" /> Member since {memberSince}
                </p>
              )}
            </div>
          </div>

          {seller.is_verified ? (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#FFF3E8] border border-[#FDBA8C] px-4 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              <span className="text-xs font-bold text-[#F97316]">
                {seller.verification_badge || "Verified Supplier"}
              </span>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
              <span className="text-xs font-medium text-gray-500">Unverified Supplier</span>
            </div>
          )}

          {seller.description && (
            <p className="text-sm text-gray-600 leading-relaxed mt-5">{seller.description}</p>
          )}

          {(seller.rating || seller.years_on_kora || seller.response_rate) && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              {typeof seller.years_on_kora === "number" && (
                <div className="bg-[#FFF3E8] rounded-2xl p-4 text-center">
                  <p className="text-lg font-black text-gray-900">{seller.years_on_kora}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{seller.years_on_kora === 1 ? "Year" : "Years"} on Kora</p>
                </div>
              )}
              {typeof seller.response_rate === "number" && (
                <div className="bg-[#FFF3E8] rounded-2xl p-4 text-center">
                  <p className="text-lg font-black text-gray-900">{seller.response_rate}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Response Rate</p>
                </div>
              )}
              {seller.rating ? (
                <div className="bg-[#FFF3E8] rounded-2xl p-4 text-center">
                  <p className="text-lg font-black text-gray-900">{seller.rating}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Rating</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">Products from {displayName}</h2>
            <span className="text-xs text-gray-400">{products.length} listed</span>
          </div>

          {products.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No products listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map(function (p) {
                return (
                  <div
                    key={p.id}
                    onClick={function () { router.push("/product/" + p.id); }}
                    className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="aspect-square bg-white relative overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] font-semibold text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{p.name}</p>
                      <p className="mt-1 text-sm font-bold text-[#F97316]">{formatNaira(p.price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
