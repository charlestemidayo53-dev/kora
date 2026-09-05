"use client";

// app/discover/page.tsx
//
// Dedicated page for externally-discovered supply — same product-card UI as
// the main Marketplace (via components/ProductCard), just filtered to
// listing_source === 'discovered'. This is NOT a second marketplace: same
// data source (getProducts()), same card, same product detail page, same
// RFQ flow. It's a filtered view + a place to explain what "discovered
// supply" means to a buyer landing here for the first time.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

type Product = {
  id?: string;
  name: string;
  price: string;
  location?: string;
  image?: string;
  category?: string;
  seller?: string;
  company_name?: string;
  owner: string;
  description?: string;
  listing_source?: "internal" | "discovered";
  availability?: "available" | "limited" | "unavailable";
  source_name?: string;
};

export default function DiscoverPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [poppingIds, setPoppingIds] = useState<Set<string>>(new Set());
  const [hideUnavailable, setHideUnavailable] = useState(true);

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);

      try {
        const all = await getProducts();
        const discovered = Array.isArray(all)
          ? all.filter(function (p: Product) { return p.listing_source === "discovered"; })
          : [];
        setProducts(discovered);
      } catch (err) {
        console.error("Failed to load discovered products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(function () {
    if (!user?.id) {
      setWishlistIds(new Set());
      return;
    }
    async function loadWishlist() {
      try {
        const { data, error } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);
        if (error) throw error;
        setWishlistIds(new Set((data || []).map(function (w: any) { return w.product_id; })));
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    }
    loadWishlist();
  }, [user]);

  const filteredProducts = useMemo(function () {
    return products.filter(function (product) {
      if (hideUnavailable && product.availability === "unavailable") return false;

      const name = product?.name || "";
      const location = product?.location || "";
      const seller = product?.seller || product?.company_name || product?.source_name || "";
      const category = product?.category || "";

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        location.toLowerCase().includes(search.toLowerCase()) ||
        seller.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [products, search, hideUnavailable]);

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
          <div className="flex items-center gap-3 mb-1">
            <a href="/" className="text-sm text-gray-500 hover:text-[#F97316] transition">
              Marketplace
            </a>
            <span className="text-gray-200">|</span>
            <span className="text-sm font-bold text-gray-800">Discover</span>
          </div>

          <div className="relative mt-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Search discovered supply"
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1.5">Discover Supply</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            Products sourced from external suppliers Kora has found for you. Every listing shows
            where it came from — click through to request it and Kora connects you with the
            actual supplier.
          </p>

          <label className="mt-3 inline-flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={hideUnavailable}
              onChange={function (e) { setHideUnavailable(e.target.checked); }}
              className="rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]"
            />
            Hide currently unavailable listings
          </label>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading discovered supply...</p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-700 text-base font-semibold">No discovered supply yet.</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon — new supply is added automatically.</p>
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
