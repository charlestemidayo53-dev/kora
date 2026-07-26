"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminWalletWithdrawalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={function () { router.push("/admin/wallet"); }}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2e8b5a] transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Wallet
          </button>
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-base font-bold text-[#1a4731]">Kora</span>
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1a4731] mb-1">Withdrawals</h1>
          <p className="text-gray-600 text-sm">Review and approve seller withdrawal requests.</p>
        </div>

        <div className="bg-white rounded-3xl text-center py-24 border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-[#f0faf4] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a4 4 0 00-8 0v2M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No withdrawal requests</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            This page is a placeholder. Seller withdrawal requests will appear here once connected to Supabase.
          </p>
        </div>
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        2025 Kora Marketplace · Empowering Nigerian Agriculture
      </div>
    </div>
  );
}