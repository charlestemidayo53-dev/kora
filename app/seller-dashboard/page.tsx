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

  const backBtnClass = "flex items-center gap-2 text-[#6B7280] hover:text-[#F97316] transition text-sm font-semibold";
  const addBtnClass = "bg-[#F97316] text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-[#EA580C] transition shadow-sm hover:shadow-md";
  const editBtnClass = "flex-1 text-center bg-[#FFF7ED] text-[#F97316] py-2.5 rounded-lg text-xs font-bold hover:bg-[#F97316] hover:text-white transition border border-[#FED7AA]";
  const deleteBtnClass = "flex-1 text-center bg-white text-[#DC2626] py-2.5 rounded-lg text-xs font-bold border border-[#E5E7EB] hover:bg-red-50 hover:border-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280] text-sm font-medium">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Navigation */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={function () { router.push("/dashboard"); }} className={backBtnClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#111827] tracking-tight">Kora</span>
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] mb-2">My Listings</h1>
            <p className="text-[#6B7280] text-sm font-medium">
              Manage your products and inventory on Kora
            </p>
          </div>
          <a href="/add-product" className={addBtnClass + " flex items-center justify-center gap-2"}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </a>
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="bg-[#F9FAFB] rounded-xl text-center py-24 px-6 border border-[#E5E7EB]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E5E7EB] shadow-sm">
              <svg className="w-10 h-10 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">No products listed yet</h3>
            <p className="text-[#6B7280] mb-8 max-w-xs mx-auto text-sm">
              Start selling by listing your first product on the marketplace.
            </p>
            <a href="/add-product" className={addBtnClass}>
              List Your First Product
            </a>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(function (product) {
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-52 bg-[#F9FAFB] relative overflow-hidden border-b border-[#E5E7EB]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#E5E7EB]">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {product.category && (
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#F97316] text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-[#FED7AA] uppercase tracking-wider">
                      {product.category}
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-[#111827] mb-1 line-clamp-1">{product.name}</h2>
                  <p className="text-[#F97316] font-black text-xl mb-1">₦{product.price}</p>
                  {product.location && (
                    <div className="flex items-center gap-1.5 text-[#6B7280] mb-4">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs font-medium truncate">{product.location}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-auto pt-6 border-t border-[#E5E7EB]">
                    <a href={`/edit-product/${product.id}`} className={editBtnClass}>
                      Edit Listing
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

      <div className="text-center py-10 text-xs font-bold text-[#6B7280] uppercase tracking-[0.2em] border-t border-[#E5E7EB]">
        © 2026 Kora Marketplace · Verified Supplier Dashboard
      </div>
    </div>
  );
}
