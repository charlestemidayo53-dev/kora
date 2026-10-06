"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMergedFeed, CATEGORY_DATA } from "@/lib/storage";
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
  listing_source?: "internal" | "discovered" | "catalogue_only";
  availability?: "available" | "limited" | "unavailable";
  source_name?: string;
  is_estimated_price?: boolean;
  catalogue_product_id?: string;
};

type Banner = {
  id: string;
  cta: string;
  href: string;
  image: string;
};

const CATEGORY_PILLS = CATEGORY_DATA.map(function (c) {
  return { name: c.name, slug: c.id };
});

const banners: Banner[] = [
  {
    id: "kora-sourcing",
    cta: "Start sourcing",
    href: "#products",
    image: "/kora log.jpeg",
  },
  {
    id: "secure-trading",
    cta: "Browse products",
    href: "#products",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "trade-on-the-go",
    cta: "Start supplying",
    href: "/add-product",
    image:
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "verified-suppliers",
    cta: "Meet our suppliers",
    href: "/discover",
    image:
      "https://images.unsplash.com/photo-1700727448575-6f1680cd7d75?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "nationwide-reach",
    cta: "Explore categories",
    href: "/categories",
    image: "/kora log.jpeg",
  },
  {
    id: "seller-tools",
    cta: "Add product",
    href: "/add-product",
    image: "/farm land.jpg",
  },
];

function normalizeCategory(value: string | undefined): string {
  return (value || "").trim().toLowerCase();
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6]">
          <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MarketplacePageInner />
    </Suspense>
  );
}

function MarketplacePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [poppingIds, setPoppingIds] = useState<Set<string>>(new Set());
  const [activeBanner, setActiveBanner] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser({ id: data.user.id });
      await loadProducts();
    }

    init();
  }, []);

  useEffect(
    function () {
      const q = searchParams.get("q");
      if (q !== null) setSearch(q);

      const cat = searchParams.get("category");
      if (cat !== null) setCategoryFilter(cat);
    },
    [searchParams],
  );

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

  useEffect(
    function () {
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
          setWishlistIds(
            new Set(
              (data || [])
                .map(function (wishlist: { product_id: string | null }) {
                  return wishlist.product_id;
                })
                .filter((productId): productId is string => Boolean(productId)),
            ),
          );
        } catch (err) {
          console.error("Failed to load wishlist:", err);
        }
      }

      loadWishlist();
    },
    [user],
  );

  async function loadProducts() {
    try {
      const data = await getMergedFeed();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(
    function () {
      const normalizedSearch = search.trim().toLowerCase();

      return products.filter(function (product) {
        const name = product?.name || "";
        const location = product?.location || "";
        const seller = product?.seller || product?.company_name || "";
        const category = product?.category || "";
        const description = product?.description || "";

        const searchableText = [name, location, seller, category, description]
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchableText.includes(normalizedSearch);
        const matchesCategory =
          !categoryFilter ||
          normalizeCategory(category) === normalizeCategory(categoryFilter);

        return matchesSearch && matchesCategory;
      });
    },
    [products, search, categoryFilter],
  );

  function selectCategory(slug: string) {
    setCategoryFilter(function (current) {
      return current === slug ? null : slug;
    });
  }

  function handleBannerTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  }

  function handleBannerTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    touchDeltaX.current =
      (e.touches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
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

  async function toggleWishlist(
    e: React.MouseEvent<Element>,
    productId: string | undefined,
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;

    const isWishlisted = wishlistIds.has(productId);
    const previousWishlistIds = wishlistIds;
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
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      setWishlistIds(previousWishlistIds);
    }
  }

  function goToProduct(product: Product) {
    if (product.listing_source === "catalogue_only" && product.catalogue_product_id) {
      router.push("/catalogue/" + product.catalogue_product_id);
      return;
    }

    if (product.id) {
      router.push("/product/" + product.id);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">Marketplace</h1>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={search}
                onChange={function (e) {
                  setSearch(e.target.value);
                }}
                placeholder="Search products, suppliers, or locations"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
            <a
              href="/add-product"
              className="flex-shrink-0 flex items-center gap-1.5 bg-[#F97316] hover:bg-[#c2410c] text-white px-3.5 sm:px-4 py-3 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Product</span>
            </a>
          </div>

          <div
            className="mt-3 -mx-4 sm:-mx-6 px-4 sm:px-6 flex gap-2.5 overflow-x-auto kora-cat-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              type="button"
              onClick={function () {
                setCategoryFilter(null);
              }}
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
              const isActive = categoryFilter === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={function () {
                    selectCategory(cat.slug);
                  }}
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

      {/* ── CORE CAROUSEL ── */}
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
                  key={banner.id}
                  className={
                    "absolute inset-0 transition-opacity duration-700 " +
                    (isActive ? "opacity-100" : "opacity-0 pointer-events-none")
                  }
                >
                  <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              );
            })}

            <div className="absolute bottom-3 left-5 right-5 sm:left-10 sm:right-10 z-10 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {banners.map(function (banner, index) {
                  return (
                    <button
                      key={banner.id}
                      type="button"
                      aria-label={"Show banner " + (index + 1)}
                      onClick={function () {
                        setActiveBanner(index);
                      }}
                      className={
                        "h-1.5 rounded-full transition-all " +
                        (index === activeBanner ? "w-7 bg-white" : "w-1.5 bg-white/50")
                      }
                    />
                  );
                })}
              </div>

              <a
                href={banners[activeBanner].href}
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#F97316] hover:bg-[#FFF3E8] transition whitespace-nowrap"
              >
                {banners[activeBanner].cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-black text-gray-900">
            {categoryFilter
              ? CATEGORY_PILLS.find(function (c) { return c.slug === categoryFilter; })?.name || "Products"
              : "All Products"}
          </h2>
          <span className="text-xs sm:text-sm text-gray-500">{filteredProducts.length} results</span>
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
                  onToggleWishlist={function (e) {
                    toggleWishlist(e, product.id);
                  }}
                  onClick={function () {
                    goToProduct(product);
                  }}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}