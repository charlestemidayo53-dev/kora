"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

type Product = {
  id?: string;
  name: string;
  price: string;
  location?: string;
  quantity?: string;
  available_quantity?: string | number;
  image?: string;
  category?: string;
  seller?: string;
  company_name?: string;
  owner: string;
  moq?: string | number;
  minimum_order_quantity?: string | number;
  unit?: string;
  verified?: boolean;
  is_verified?: boolean;
  description?: string;
};

const banners = [
  {
    eyebrow: "Kora Sourcing",
    title: "Find verified suppliers faster",
    body: "Compare products, message sellers, and place secure orders from one marketplace.",
    cta: "Start sourcing",
    href: "#products",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Secure Trading",
    title: "Buy farm inputs with confidence",
    body: "Use Kora to discover sellers, check stock details, and keep your business moving.",
    cta: "Browse products",
    href: "#products",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Trade On the Go",
    title: "Run your business from your phone",
    body: "Manage orders, chat with buyers, and track sales anywhere — Kora is built mobile-first.",
    cta: "Open dashboard",
    href: "/dashboard",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Verified Suppliers",
    title: "Every supplier screened before listing",
    body: "Trade with confidence — Kora verifies business details before sellers go live.",
    cta: "Meet our suppliers",
    href: "/suppliers",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Nationwide Reach",
    title: "From the farm to every Nigerian state",
    body: "Source agricultural products and raw materials from sellers across all 36 states.",
    cta: "Explore categories",
    href: "/categories",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Seller Tools",
    title: "Show buyers what you have in stock",
    body: "List products with MOQ, units, location, and company details buyers need before ordering.",
    cta: "Add product",
    href: "/add-product",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  },
];

// ─── Product card helpers / icons (added — everything else in this file is unchanged) ──
function formatNaira(price: string | number | undefined): string {
  if (price === undefined || price === null || price === "") return "₦0";
  const numeric =
    typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, ""));
  if (isNaN(numeric)) return "₦" + price;
  return "₦" + numeric.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function CardHeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-[17px] h-[17px]"
      fill={filled ? "#ef4444" : "none"}
      stroke={filled ? "#ef4444" : "#374151"}
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7.5-4.6-10-9.1C.5 8.6 2 5 5.6 5c2 0 3.4 1.1 4.4 2.5C11 6.1 12.4 5 14.4 5 18 5 19.5 8.6 22 11.9 19.5 16.4 12 21 12 21z"
      />
    </svg>
  );
}

function CardVerifiedBadge() {
  return (
    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-white/95 text-[#1a7a4a] text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">
      <svg viewBox="0 0 24 24" className="w-3 h-3">
        <path
          fill="#1a7a4a"
          d="M12 2l2.4 1.7 2.9-.4 1.1 2.7 2.7 1.1-.4 2.9L22 12l-1.7 2.4.4 2.9-2.7 1.1-1.1 2.7-2.9-.4L12 22l-2.4-1.7-2.9.4-1.1-2.7-2.7-1.1.4-2.9L2 12l1.7-2.4-.4-2.9 2.7-1.1 1.1-2.7 2.9.4L12 2z"
        />
        <path
          d="M8.6 12.3l2 2 4.4-4.6"
          stroke="white"
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified Supplier
    </div>
  );
}

function CardPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6]">
        <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomePageInner />
    </Suspense>
  );
}

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeBanner, setActiveBanner] = useState(0);

  // Added — tracks which product ids the current user has wishlisted,
  // so the heart icon renders filled/unfilled correctly.
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      await loadProducts();
    }

    init();
  }, []);

  useEffect(function () {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(function () {
    const timer = window.setInterval(function () {
      setActiveBanner(function (current) {
        return (current + 1) % banners.length;
      });
    }, 4500);

    return function () {
      window.clearInterval(timer);
    };
  }, []);

  // Added — loads the signed-in user's wishlist once we know who they are.
  useEffect(function () {
    if (!user?.id) {
      setWishlistIds(new Set());
      return;
    }
    async function loadWishlist() {
      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select("product_id")
          .eq("user_id", user.id);
        if (error) throw error;
        setWishlistIds(new Set((data || []).map(function (w: any) { return w.product_id; })));
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    }
    loadWishlist();
  }, [user]);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(function () {
    return products.filter(function (product) {
      const name = product?.name || "";
      const location = product?.location || "";
      const seller = product?.seller || product?.company_name || "";
      const category = product?.category || "";
      const description = product?.description || "";

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        location.toLowerCase().includes(search.toLowerCase()) ||
        seller.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [products, search]);

  function stopCardNav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Added — toggles wishlist state for a product, persisting to Supabase
  // when the user is logged in. Card click navigation is stopped so the
  // heart doesn't also trigger a route change.
  async function toggleWishlist(e: React.MouseEvent, productId: string | undefined) {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;

    const isWishlisted = wishlistIds.has(productId);
    const next = new Set(wishlistIds);
    if (isWishlisted) next.delete(productId);
    else next.add(productId);
    setWishlistIds(next);

    if (!user?.id) return;

    try {
      if (isWishlisted) {
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      } else {
        await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      // Revert on failure.
      setWishlistIds(wishlistIds);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Search products, suppliers, or locations"
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#2e8b5a]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-5">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl min-h-[170px] sm:min-h-[260px] bg-[#173f2a]">
            {banners.map(function (banner, index) {
              const isActive = index === activeBanner;
              return (
                <div
                  key={banner.title}
                  className={"absolute inset-0 transition-opacity duration-700 " + (isActive ? "opacity-100" : "opacity-0 pointer-events-none")}
                >
                  <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
                  <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-10 max-w-2xl text-white">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#c7f5d8] mb-1.5">{banner.eyebrow}</p>
                    <h1 className="text-xl sm:text-4xl font-black leading-tight">{banner.title}</h1>
                    <p className="mt-2 text-xs sm:text-base text-white/85 max-w-xl">{banner.body}</p>
                    <a href={banner.href} className="mt-3 sm:mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-white px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-[#1a4731] hover:bg-[#f0faf4] transition">
                      {banner.cta}
                    </a>
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-3 left-5 sm:left-10 flex gap-2">
              {banners.map(function (_, index) {
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={"Show banner " + (index + 1)}
                    onClick={function () { setActiveBanner(index); }}
                    className={"h-1.5 rounded-full transition-all " + (index === activeBanner ? "w-7 bg-white" : "w-1.5 bg-white/50")}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <h2 className="text-lg sm:text-2xl font-black text-[#1a4731] mb-4 sm:mb-6">For You</h2>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading marketplace products...</p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-700 text-base font-semibold">No products found.</p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {filteredProducts.map(function (product, i) {
              const productId = product.id || String(i);
              const verified = Boolean(product.verified || product.is_verified);
              const wishlisted = wishlistIds.has(productId);

              return (
                <div
                  key={productId}
                  onClick={() => router.push("/product/" + product.id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group flex flex-col cursor-pointer"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] font-semibold text-gray-400">No Image</div>
                    )}

                    <button
                      type="button"
                      onClick={function (e) { toggleWishlist(e, product.id); }}
                      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/95 shadow-sm flex items-center justify-center hover:bg-white active:scale-90 transition"
                    >
                      <CardHeartIcon filled={wishlisted} />
                    </button>

                    {verified && <CardVerifiedBadge />}
                  </div>

                  <div className="p-2 sm:p-2.5 flex flex-col flex-1 gap-1">
                    <h3 className="text-[11px] sm:text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#2e8b5a]">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-2">{product.description}</p>
                    )}

                    {product.location && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <CardPinIcon />
                        <span className="truncate">{product.location}</span>
                      </div>
                    )}

                    <p className="mt-auto pt-1 text-xs sm:text-sm font-bold text-[#F97316]">
                      {formatNaira(product.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}