"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminWalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    }
    init();
  }, [router]);

  const cardClass = "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#2e8b5a] transition group";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={function () { router.push("/admin"); }}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2e8b5a] transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Admin
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
          <h1 className="text-3xl font-black text-[#1a4731] mb-1">Wallet Management</h1>
          <p className="text-gray-600 text-sm">
            Admin overview of escrow balances, transactions, and withdrawals.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-bold mb-2">Total Escrow Balance</p>
            <p className="text-2xl font-black text-[#1a4731]">N0</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-bold mb-2">Pending Withdrawals</p>
            <p className="text-2xl font-black text-[#1a4731]">N0</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-bold mb-2">Total Transactions</p>
            <p className="text-2xl font-black text-[#1a4731]">0</p>
          </div>
        </div>

        {/* Section Links */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">Manage</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <a href="/admin/wallet/transactions" className={cardClass}>
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Transactions</h3>
            <p className="text-gray-500 text-sm">View all wallet transaction history</p>
          </a>

          <a href="/admin/wallet/withdrawals" className={cardClass}>
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a4 4 0 00-8 0v2M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Withdrawals</h3>
            <p className="text-gray-500 text-sm">Review and approve withdrawal requests</p>
          </a>

          <a href="/admin/wallet/settings" className={cardClass}>
            <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition">
              <svg className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Settings</h3>
            <p className="text-gray-500 text-sm">Configure wallet and escrow rules</p>
          </a>
        </div>
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        2025 Kora Marketplace · Empowering Nigerian Agriculture
      </div>
    </div>
  );
}