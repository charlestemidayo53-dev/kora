"use client";

import React, { useEffect, useMemo, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getProductById, getProducts, getSellerProfile } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

type Product = {
  id?: string;
  name: string;
  price: string;
  location: string;
  quantity: string;
  image?: string;
  // NEW — optional multi-image gallery. Falls back to `image` alone if absent.
  images?: string[];
  category: string;
  subcategory?: string;
  // NEW — optional fields, only rendered when present.
  brand?: string;
  minimum_order_quantity?: string | number;
  seller: string;
  owner: string;
  state?: string;
  city?: string;
  description?: string;
  is_verified?: boolean;
  unit?: string;
  created_at?: string;
  estimated_delivery?: string;
  // NEW — dynamic specs object, e.g. { Origin: "Nigeria", Grade: "A" }.
  specifications?: Record<string, string>;
  // NEW — fallback individual spec fields, used only if `specifications` is absent.
  origin?: string;
  weight?: string;
  packaging?: string;
  color?: string;
  size?: string;
  material?: string;
  moisture_content?: string;
  purity?: string;
  grade?: string;
  variety?: string;
  processing_method?: string;
  shelf_life?: string;
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
  // NEW — optional, only rendered when present.
  logo_url?: string;
  years_on_kora?: number;
  response_rate?: number;
};

// ─── Formatting helpers ─────────────────────────────────────────────────────
function formatNaira(price: string | number | undefined): string {
  if (price === undefined || price === null || price === "") return "₦0";
  const numeric =
    typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, ""));
  if (isNaN(numeric)) return "₦" + price;
  return "₦" + numeric.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function formatUnitLabel(unit?: string): string | null {
  if (!unit) return null;
  const normalized = unit.trim().toLowerCase();
  const map: Record<string, string> = {
    kg: "Per Kilogram",
    kilogram: "Per Kilogram",
    kilograms: "Per Kilogram",
    bag: "Per Bag",
    bags: "Per Bag",
    ton: "Per Ton",
    tons: "Per Ton",
    tonne: "Per Ton",
    tonnes: "Per Ton",
    carton: "Per Carton",
    cartons: "Per Carton",
    piece: "Per Piece",
    pieces: "Per Piece",
    pc: "Per Piece",
    pcs: "Per Piece",
    litre: "Per Litre",
    litres: "Per Litre",
    liter: "Per Litre",
    liters: "Per Litre",
    l: "Per Litre",
  };
  if (map[normalized]) return map[normalized];
  return "Per " + unit.charAt(0).toUpperCase() + unit.slice(1);
}

function buildSpecs(product: Product): { label: string; value: string }[] {
  if (product.specifications && Object.keys(product.specifications).length > 0) {
    return Object.entries(product.specifications)
      .filter(function ([, value]) { return Boolean(value); })
      .map(function ([key, value]) {
        return {
          label: key.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }),
          value: String(value),
        };
      });
  }

  const fallbackFields: [string, string | undefined][] = [
    ["Origin", product.origin],
    ["Weight", product.weight],
    ["Packaging", product.packaging],
    ["Color", product.color],
    ["Size", product.size],
    ["Material", product.material],
    ["Moisture Content", product.moisture_content],
    ["Purity", product.purity],
    ["Grade", product.grade],
    ["Variety", product.variety],
    ["Processing Method", product.processing_method],
    ["Shelf Life", product.shelf_life],
  ];

  return fallbackFields
    .filter(function ([, value]) { return Boolean(value); })
    .map(function ([label, value]) { return { label, value: value as string }; });
}

// ─── Small icon components ──────────────────────────────────────────────────
function IconTruck() {
  return (
    <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h11v8H3zM14 10h4l3 4v1h-7zM6 19a2 2 0 100-4 2 2 0 000 4zM17.5 19a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconRefund() {
  return (
    <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h11a5 5 0 010 10H9m-6-10l4-4m-4 4l4 4" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [activeImage, setActiveImage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"escrow" | "direct">("escrow");

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

          try {
            const all = await getProducts();
            const related = Array.isArray(all)
              ? all
                  .filter(function (p: Product) {
                    return p.id !== prod.id && p.category === prod.category;
                  })
                  .slice(0, 8)
              : [];
            setRelatedProducts(related);
          } catch (err) {
            console.error("Error loading related products:", err);
          }
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

  const galleryImages = useMemo(function () {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product]);

  const specs = useMemo(function () {
    return product ? buildSpecs(product) : [];
  }, [product]);

  function handleGalleryTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleGalleryTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleGalleryTouchEnd() {
    const delta = touchDeltaX.current;
    const SWIPE_THRESHOLD = 40;

    if (delta > SWIPE_THRESHOLD) {
      setActiveImage(function (current) { return Math.max(current - 1, 0); });
    } else if (delta < -SWIPE_THRESHOLD) {
      setActiveImage(function (current) { return Math.min(current + 1, galleryImages.length - 1); });
    }

    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  function handleMessage() {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!product?.owner) return;
    router.push(`/message?to=${encodeURIComponent(product.owner)}`);
  }

  function handleOrderNowClick() {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setShowPaymentModal(true);
  }

  function handleConfirmOrder() {
    if (!product?.id) return;
    router.push(`/order-review/${product.id}?payment=${paymentMethod}`);
    setShowPaymentModal(false);
  }

  function goToSellerProfile() {
    if (!product?.owner) return;
    router.push(`/seller/${encodeURIComponent(product.owner)}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const sellerInitial = (product.seller || product.owner || "S").charAt(0).toUpperCase();
  const unitLabel = formatUnitLabel(product.unit);

  const infoItems = [
    {
      label: "Minimum Order Quantity",
      value: product.minimum_order_quantity
        ? `${product.minimum_order_quantity}${product.unit ? " " + product.unit : ""}`
        : undefined,
    },
    {
      label: "Available Quantity",
      value: product.quantity ? `${product.quantity}${product.unit ? " " + product.unit : ""}` : undefined,
    },
    { label: "Unit of Measurement", value: product.unit },
    { label: "Brand", value: product.brand },
  ].filter(function (item) { return Boolean(item.value); });

  return (
    <div className="min-h-screen bg-[#f5f7f6] pb-28">
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={function () { router.back(); }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#2e8b5a] transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-gray-200">|</span>
          <a href="/marketplace" className="text-sm text-gray-500 hover:text-[#2e8b5a] transition">
            Marketplace
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">
        {/* ── Product gallery ───────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="relative aspect-square sm:aspect-[4/3] bg-[#f0faf4] overflow-hidden"
            onTouchStart={handleGalleryTouchStart}
            onTouchMove={handleGalleryTouchMove}
            onTouchEnd={handleGalleryTouchEnd}
          >
            {galleryImages.length > 0 ? (
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeImage * 100}%)` }}
              >
                {galleryImages.map(function (img, index) {
                  return (
                    <img
                      key={index}
                      src={img}
                      alt={product.name}
                      className="w-full h-full flex-shrink-0 object-cover"
                    />
                  );
                })}
              </div>
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

            {galleryImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {galleryImages.map(function (_, index) {
                  return (
                    <button
                      key={index}
                      type="button"
                      aria-label={"Show image " + (index + 1)}
                      onClick={function () { setActiveImage(index); }}
                      className={"h-1.5 rounded-full transition-all " + (index === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/60")}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Price + core info ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <p className="text-3xl font-black text-[#F97316]">{formatNaira(product.price)}</p>
          {unitLabel && <p className="text-sm text-gray-500 font-medium mt-1">{unitLabel}</p>}

          <h1 className="text-xl font-black text-gray-900 mt-4">{product.name}</h1>

          {product.subcategory && (
            <span className="inline-block bg-[#f0faf4] text-[#2e8b5a] text-xs font-semibold px-3 py-1 rounded-full mt-3">
              {product.subcategory}
            </span>
          )}

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed mt-3">{product.description}</p>
          )}

          {infoItems.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-5">
              {infoItems.map(function (item) {
                return (
                  <div key={item.label} className="bg-[#f0faf4] rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-1 font-medium">{item.label}</p>
                    <p className="font-bold text-[#1a4731] text-sm">{item.value}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Delivery ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <IconTruck />
            <h2 className="text-sm font-bold text-gray-800">Delivery</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
            <li>Delivery available to your location.</li>
            <li>Delivery options depend on the supplier's location.</li>
            <li>Estimated delivery time will be provided by the supplier after order confirmation.</li>
          </ul>
          {product.estimated_delivery && (
            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <p className="text-sm text-amber-800">
                Estimated Delivery: <span className="font-bold">{product.estimated_delivery}</span>
              </p>
            </div>
          )}
        </div>

        {/* ── Buyer Protection ───────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Buyer Protection</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-[#f0faf4] rounded-xl flex items-center justify-center flex-shrink-0">
                <IconShield />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Secure Escrow Payment</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  Payments made through KORA Escrow are held securely until both buyer and seller complete the transaction according to the agreed terms.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-[#f0faf4] rounded-xl flex items-center justify-center flex-shrink-0">
                <IconRefund />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Refund Policy</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  Refunds are handled according to KORA's Buyer Protection Policy if the transaction qualifies under our dispute resolution process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Specifications ─────────────────────────────────────────────── */}
        {specs.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {specs.map(function (spec) {
                return (
                  <div key={spec.label}>
                    <p className="text-xs text-gray-400 font-medium">{spec.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{spec.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Seller info ────────────────────────────────────────────────── */}
        <div
          onClick={goToSellerProfile}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:border-[#c8e6d4] transition"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Seller Information</h2>
            <IconChevronRight />
          </div>

          <div className="flex items-center gap-3 mb-4">
            {seller?.logo_url ? (
              <img src={seller.logo_url} alt={seller.business_name || "Supplier"} className="w-12 h-12 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 bg-[#2e8b5a] rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">{sellerInitial}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate">
                {seller?.business_name || product.seller || product.owner}
              </p>
              {(seller?.city || seller?.state) && (
                <p className="text-xs text-gray-500 truncate">
                  {seller?.city ? seller.city + ", " : ""}
                  {seller?.state}
                </p>
              )}
            </div>
          </div>

          {seller?.is_verified ? (
            <div className="flex items-center gap-2 bg-[#f0faf4] border border-[#c8e6d4] px-4 py-2.5 rounded-xl mb-3">
              <IconShield />
              <span className="text-xs font-bold text-[#2e8b5a]">Verified Supplier</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs font-medium text-gray-500">Unverified Supplier</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            {typeof seller?.years_on_kora === "number" && (
              <span>{seller.years_on_kora} {seller.years_on_kora === 1 ? "year" : "years"} on KORA</span>
            )}
            {typeof seller?.response_rate === "number" && (
              <span>{seller.response_rate}% response rate</span>
            )}
            {seller?.rating && seller.rating > 0 ? <span>{seller.rating} rating</span> : null}
          </div>

          <button
            onClick={function (e) { e.stopPropagation(); goToSellerProfile(); }}
            className="w-full border border-[#2e8b5a] text-[#2e8b5a] hover:bg-[#f0faf4] py-2.5 rounded-xl font-semibold text-sm transition"
          >
            View Supplier Profile
          </button>
        </div>

        {/* ── Related products ───────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-800">Related Products</h2>
              <a href="/marketplace" className="text-xs font-semibold text-[#2e8b5a] hover:text-[#1a4731] transition">
                See All
              </a>
            </div>
            <p className="text-gray-500 text-sm mb-4">Other listings in {product.category}</p>

            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {relatedProducts.map(function (rp) {
                return (
                  <div
                    key={rp.id}
                    onClick={function () { router.push("/product/" + rp.id); }}
                    className="flex-shrink-0 w-36 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="aspect-square bg-white relative overflow-hidden">
                      {rp.image ? (
                        <img src={rp.image} alt={rp.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] font-semibold text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{rp.name}</p>
                      <p className="mt-1 text-sm font-bold text-[#F97316]">{formatNaira(rp.price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom action bar ─────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-30">
        <button
          onClick={handleMessage}
          className="flex-1 bg-white border border-[#2e8b5a] text-[#2e8b5a] hover:bg-[#f0faf4] py-3 rounded-xl font-semibold text-sm transition"
        >
          Message Supplier
        </button>
        <button
          onClick={handleOrderNowClick}
          className="flex-1 bg-[#F97316] hover:bg-[#ea6a0c] text-white py-3 rounded-xl font-semibold text-sm transition"
        >
          Order Now
        </button>
      </div>

      {/* ── Order Now / payment method modal ─────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-gray-900">Choose Payment Method</h3>
              <button onClick={function () { setShowPaymentModal(false); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={function () { setPaymentMethod("escrow"); }}
                className={
                  "w-full text-left p-4 rounded-2xl border-2 transition " +
                  (paymentMethod === "escrow" ? "border-[#2e8b5a] bg-[#f0faf4]" : "border-gray-200")
                }
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-800">Secure Escrow Payment</span>
                  <span className="text-[10px] font-bold text-white bg-[#2e8b5a] px-2 py-0.5 rounded-full">RECOMMENDED</span>
                </div>
                {paymentMethod === "escrow" && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    KORA securely holds your payment until the transaction is completed according to the agreed terms between you and the supplier.
                  </p>
                )}
              </button>

              <button
                onClick={function () { setPaymentMethod("direct"); }}
                className={
                  "w-full text-left p-4 rounded-2xl border-2 transition " +
                  (paymentMethod === "direct" ? "border-[#2e8b5a] bg-[#f0faf4]" : "border-gray-200")
                }
              >
                <span className="font-bold text-sm text-gray-800">Direct Payment</span>
              </button>
            </div>

            <button
              onClick={handleConfirmOrder}
              className="w-full mt-6 bg-[#F97316] hover:bg-[#ea6a0c] text-white py-3.5 rounded-xl font-bold text-sm transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}