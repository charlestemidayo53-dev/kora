"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductsByOwner, deleteProduct } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: string;
  location?: string;
  category?: string;
  image?: string;
  quantity?: string;
  unit?: string;
  owner: string;
};

export default function SellerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      await loadProducts(data.user.email);
    }
    init();
  }, [router]);

  async function loadProducts(email: string) {
    try {
      const data = await getProductsByOwner(email);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load seller products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this product? This cannot be undone.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(function (prev) {
        return prev.filter(function (p) {
          return p.id !== id;
        });
      });
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const backBtnClass = "flex items-center gap-2 text-gray-500 hover:text-[#2e8b5a] transition text-xs sm:text-sm font-medium";
  const addBtnClass = "bg-[#2e8b5a] text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#1a4731] transition";
  const editBtnClass = "flex-1 text-center bg-[#f0faf4] text-[#2e8b5a] py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#2e8b5a] hover:text-white transition";
  const deleteBtnClass = "flex-1 text-center bg-red-50 text-red-500 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button onClick={function () { router.push("/dashboard"); }} className={backBtnClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-sm sm:text-base font-bold text-[#1a4731]">Kora</span>
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-[#1a4731] mb-1">Seller Dashboard</h1>
            <p className="text-gray-600 text-xs sm:text-sm truncate">
              Manage your product listings, {user?.email}
            </p>
          </div>
          <a href="/add-product" className={addBtnClass + " w-full sm:w-auto text-center flex-shrink-0"}>
            + Add Product
          </a>
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl text-center py-16 sm:py-24 px-4 border border-gray-100 shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0faf4] rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">No products listed yet</h3>
            <p className="text-gray-500 mb-6 sm:mb-8 max-w-xs mx-auto text-sm">
              Start selling by listing your first product on Kora.
            </p>
            <a href="/add-product" className={addBtnClass}>
              List Your First Product
            </a>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map(function (product) {
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="h-40 sm:h-48 bg-gradient-to-br from-[#f0faf4] to-[#e8f5f0] relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300">
                      <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {product.category && (
                    <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-white/90 backdrop-blur-sm text-[#2e8b5a] text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                      {product.category}
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h2>
                  <p className="text-[#2e8b5a] font-black text-lg sm:text-xl mb-1">N{product.price}</p>
                  {product.location && (
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 truncate">{product.location}</p>
                  )}

                  <div className="flex gap-2.5 sm:gap-3 mt-auto pt-3 sm:pt-4 border-t border-gray-50">
                    <a href={`/edit-product/${product.id}`} className={editBtnClass}>
                      Edit
                    </a>
                    <button
                      onClick={function () { handleDelete(product.id); }}
                      disabled={deletingId === product.id}
                      className={deleteBtnClass}
                    >
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center py-6 sm:py-8 text-xs text-gray-400">
        2026 Kora Marketplace · Empowering Nigerian suppliers  and buyers. All rights reserved.
      </div>
    </div>
  );
}