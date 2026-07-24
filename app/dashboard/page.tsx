"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    }
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.email?.split("@")[0] || "Farmer";

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1a4731]">Kora</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#f0faf4] border border-[#c8e6d4] px-4 py-2 rounded-xl">
              <div className="w-7 h-7 bg-[#2e8b5a] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-[#1a4731]">{user?.email}</span>
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/auth/login");
              }}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full translate-x-16 -translate-y-16 pointer-events-none" />
          <div className="absolute bottom-0 right-24 w-32 h-32 bg-white opacity-5 rounded-full translate-y-12 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Good day</p>
            <h1 className="text-3xl font-bold mb-2 capitalize">{firstName}</h1>
            <p className="text-green-100 text-sm max-w-md">
              Welcome to your Kora dashboard. Manage your products, track orders, and grow your agricultural business.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="/marketplace" className="bg-white text-[#2e8b5a] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-50 transition shadow">
                Browse Marketplace
              </a>
              <a href="/add-product" className="bg-[#1a4731] border border-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#153d28] transition">
                Add Product
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#1a4731]">—</div>
            <div className="text-xs text-gray-500 mt-1">My Products</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#1a4731]">—</div>
            <div className="text-xs text-gray-500 mt-1">Active Orders</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#1a4731]">—</div>
            <div className="text-xs text-gray-500 mt-1">Total Sales</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#1a4731]">N0</div>
            <div className="text-xs text-gray-500 mt-1">Escrow Balance</div>
          </div>

        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

          <a href="/marketplace" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#2e8b5a] transition-all">
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition-all">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Marketplace</h3>
            <p className="text-gray-500 text-sm">Browse and buy agricultural products</p>
          </a>

          <a href="/add-product" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#2e8b5a] transition-all">
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition-all">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Add Product</h3>
            <p className="text-gray-500 text-sm">List a new product for sale</p>
          </a>

          <a href="/seller-dashboard" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#2e8b5a] transition-all">
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition-all">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Seller Dashboard</h3>
            <p className="text-gray-500 text-sm">Manage your listings and orders</p>
          </a>

          <a href="/orders" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#2e8b5a] transition-all">
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition-all">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">My Orders</h3>
            <p className="text-gray-500 text-sm">Track your purchases and sales</p>
          </a>

          <a href="/escrow" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#2e8b5a] transition-all">
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition-all">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Escrow Payments</h3>
            <p className="text-gray-500 text-sm">Secure payment protection</p>
          </a>

          <a href="/profile" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#2e8b5a] transition-all">
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition-all">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">My Profile</h3>
            <p className="text-gray-500 text-sm">Update your account settings</p>
          </a>

        </div>
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        2025 Kora Marketplace · Empowering Nigerian Agriculture
      </div>
    </div>
  );
}