"use client";

import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

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
  listing_source?: "internal" | "discovered";
  availability?: "available" | "limited" | "unavailable";
  source_name?: string;
};

const CATEGORY_PILLS = [
  { name: "Agriculture & Food", slug: "agriculture-food" },
  { name: "Apparel & Accessories", slug: "apparel" },
  { name: "Auto, Motorcycle & Parts", slug: "auto-motorcycle" },
  { name: "Chemicals", slug: "chemicals" },
  { name: "Construction & Decoration", slug: "construction" },
  { name: "Consumer Electronics", slug: "electronics" },
  { name: "Electrical & Electronics", slug: "electrical" },
  { name: "Furniture", slug: "furniture" },
  { name: "Health & Medicine", slug: "health" },
  { name: "Industrial Equipment", slug: "industrial" },
  { name: "Lights & Lighting", slug: "lighting" },
  { name: "Manufacturing Machinery", slug: "machinery" },
  { name: "Metallurgy & Energy", slug: "metallurgy" },
  { name: "Packaging & Printing", slug: "packaging" },
  { name: "Security & Protection", slug: "security" },
  { name: "Textile", slug: "textile" },
  { name: "Tools & Hardware", slug: "tools" },
  { name: "Transportation", slug: "transportation" },
];

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
    image: "https://images.unsplash.com/photo-1700727448575-6f1680cd7d75?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Nationwide Reach",
    title: "From the farm to every Nigerian state",
    body: "Source agricultural products and raw materials from sellers across all 36 states.",
    cta: "Explore categories",
    href: "/categories",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Seller Tools",
    title: "Show buyers what you have in stock",
    body: "List products with MOQ, units, location, and company details buyers need before ordering.",
    cta: "Add product",
    href: "/add-product",
    image: "https://images.unsplash.com/photo-1553413077-190983eb075e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6]">
        <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeBanner, setActiveBanner] = useState(0);

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [poppingIds, setPoppingIds] = useState<Set<string>>(new Set());

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

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

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        location.toLowerCase().includes(search.toLowerCase()) ||
        seller.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        !categoryFilter || category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function selectCategory(name: string) {
    setCategoryFilter(function (current) {
      return current === name ? null : name;
    });
  }

  function handleBannerTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleBannerTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleBannerTouchEnd() {
    const delta = touchDeltaX.current;
    const SWIPE_THRESHOLD = 40;

    if (delta > SWIPE_THRESHOLD) {
      setActiveBanner(function (current) {
        return (current - 1 + banners.length) % banners.length;
      });
    } else if (delta < -SWIPE_THRESHOLD) {
      setActiveBanner(function (current) {
        return (current + 1) % banners.length;
      });
    }

    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  async function toggleWishlist(e: React.MouseEvent, productId: string | undefined) {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;

    const isWishlisted = wishlistIds.has(productId);
    const next = new Set(wishlistIds);
    if (isWishlisted) next.delete(productId);
    else next.add(productId);
    setWishlistIds(next);

    setPoppingIds(function (current) {
      const updated = new Set(current);
      updated.add(productId);
      return updated;
    });
    window.setTimeout(function () {
      setPoppingIds(function (current) {
        const updated = new Set(current);
        updated.delete(productId);
        return updated;
      });
    }, 220);

    if (!user?.id) return;

    try {
      if (isWishlisted) {
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      } else {
        await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
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
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div
            className="md:hidden mt-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 flex gap-2.5 overflow-x-auto kora-cat-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              type="button"
              onClick={function () { setCategoryFilter(null); }}
              className={
                "flex-shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] tracking-wide border transition " +
                (categoryFilter === null
                  ? "font-semibold bg-[#F97316] text-white border-[#F97316]"
                  : "font-medium bg-white text-gray-500 border-gray-200")
              }
            >
              All
            </button>
            {CATEGORY_PILLS.map(function (cat) {
              const isActive = categoryFilter === cat.name;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={function () { selectCategory(cat.name); }}
                  className={
                    "flex-shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] tracking-wide border transition " +
                    (isActive
                      ? "font-semibold bg-[#F97316] text-white border-[#F97316]"
                      : "font-medium bg-white text-gray-500 border-gray-200")
                  }
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
          <style>{".kora-cat-scroll::-webkit-scrollbar{display:none}"}</style>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-5">
          <div
            className="relative overflow-hidden rounded-xl sm:rounded-2xl min-h-[170px] sm:min-h-[260px] bg-[#2b1a10]"
            onTouchStart={handleBannerTouchStart}
            onTouchMove={handleBannerTouchMove}
            onTouchEnd={handleBannerTouchEnd}
          >
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
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#ffcfa0] mb-1.5">{banner.eyebrow}</p>
                    <h1 className="text-xl sm:text-4xl font-black leading-tight [-webkit-text-stroke:1px_rgba(0,0,0,0.6)] sm:[-webkit-text-stroke:2px_rgba(0,0,0,0.6)] [paint-order:stroke_fill]">{banner.title}</h1>
                    <p className="mt-2 text-xs sm:text-base text-white/85 max-w-xl">{banner.body}</p>
                    <a href={banner.href} className="mt-3 sm:mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-white px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-[#F97316] hover:bg-[#FFF3E8] transition">
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
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-black text-gray-900">For You</h2>
          <a href="/discover" className="text-xs sm:text-sm font-semibold text-[#F97316] hover:text-[#c2410c] transition">
            Discover Supply -&gt;
          </a>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-4" />
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
              const wishlisted = wishlistIds.has(productId);
              const popping = poppingIds.has(productId);

              return (
                <ProductCard
                  key={productId}
                  product={product}
                  wishlisted={wishlisted}
                  popping={popping}
                  onToggleWishlist={function (e) { toggleWishlist(e, product.id); }}
                  onClick={function () { router.push("/product/" + product.id); }}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
