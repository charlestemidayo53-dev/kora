"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts, addOrder } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

type Product = {
  id?: string;
  name: string;
  price: string;
  location: string;
  quantity?: string;
  image?: string;
  category: string;
  seller: string;
  owner: string;
};

export default function MarketplacePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      await loadProducts();
    }
    init();
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

  const filteredProducts = products.filter((product) => {
    const name = product?.name || "";
    const location = product?.location || "";
    const seller = product?.seller || "";
    const category = product?.category || "";

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      location.toLowerCase().includes(search.toLowerCase()) ||
      seller.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  async function handleBuy(product: Product) {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    // Prevent buying own product
    if (user.email === product.owner) {
      alert("You cannot buy your own product!");
      return;
    }

    setBuyingId(product.id || null);
    try {
      await addOrder({
        productName: product.name,
        buyer: user.email || "Guest",
        seller: product.owner, // Using owner email for the order
        status: "pending",
      });
      alert("Order placed successfully! The seller will contact you.");
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setBuyingId(null);
    }
  }

  const navLinkClass = "text-sm text-gray-600 hover:text-[#2e8b5a] font-medium transition";
  const addBtnClass = "bg-[#2e8b5a] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1a4731] transition";
  const searchClass = "w-full border border-gray-200 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2e8b5a] focus:border-transparent transition";
  const selectClass = "w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2e8b5a] focus:border-transparent transition";
  const viewBtnClass = "text-center bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition";
  const buyBtnClass = "bg-[#2e8b5a] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a4731] transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm";

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[#1a4731]">Kora</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className={navLinkClass}>Dashboard</a>
            <a href="/add-product" className={addBtnClass}>+ List Product</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1a4731] mb-2">Marketplace</h1>
          <p className="text-gray-600 text-lg">
            Direct access to verified agricultural producers across Nigeria.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-10">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products, sellers, or locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={searchClass}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={selectClass}
            >
              <option value="">All Categories</option>
              <option value="Grains">Grains</option>
              <option value="Livestock">Livestock</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Machinery">Machinery</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading marketplace products...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl text-center py-24 border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-[#f0faf4] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">We couldn't find any products matching your search criteria.</p>
            <button 
              onClick={() => {setSearch(""); setSelectedCategory("");}}
              className="text-[#2e8b5a] font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, i) => (
            <div
              key={product.id || i}
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full"
            >
              {/* Product Image */}
              <div className="h-60 bg-gradient-to-br from-[#f0faf4] to-[#e8f5f0] relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium uppercase tracking-wider">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-[#2e8b5a] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#2e8b5a] transition">{product.name}</h2>
                  <p className="text-[#2e8b5a] font-black text-2xl">₦{product.price}</p>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">{product.location}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold leading-none mb-1">Seller</p>
                      <p className="font-bold text-gray-800 leading-none">{product.seller}</p>
                    </div>
                  </div>
                  
                  {product.quantity && (
                    <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
                        </svg>
                      </div>
                      <span className="font-medium">{product.quantity} available</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                  <a href={`/product/${product.id}`} className={viewBtnClass}>Details</a>
                  <button
                    onClick={() => handleBuy(product)}
                    disabled={buyingId === product.id}
                    className={buyBtnClass}
                  >
                    {buyingId === product.id ? "Placing..." : "Order Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-12 text-xs text-gray-400">
        2025 Kora Marketplace · Empowering Nigerian Agriculture
      </div>
    </div>
  );
}
