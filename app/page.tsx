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
              return (
                <div
                  key={product.id || i}
                  onClick={() => router.push("/product/" + product.id)}
                  className="bg-white rounded-md shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden group flex flex-col cursor-pointer"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] font-semibold text-gray-400">No Image</div>
                    )}
                  </div>

                  <div className="p-2 sm:p-2.5 flex flex-col flex-1">
                    <h3 className="text-[11px] sm:text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#2e8b5a]">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-[10px] sm:text-[11px] text-gray-500 line-clamp-1">{product.description}</p>
                    )}
                    <p className="mt-1.5 text-xs sm:text-sm font-bold text-[#b45309]">NGN {product.price}</p>
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