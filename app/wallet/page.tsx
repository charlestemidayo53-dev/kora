"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import {
  getOrCreateWallet,
  getWalletTransactions,
  formatNaira,
  statusColor,
  type Wallet,
  type WalletTransaction,
} from "@/lib/wallet";

const PAGE_SIZE = 8;

export default function WalletPage() {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(function () {
    async function load() {
      setLoading(true);
      const currentUser = await getUser();
      if (!currentUser) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(currentUser);

      const w = await getOrCreateWallet(currentUser.id);
      setWallet(w);

      if (w) {
        const tx = await getWalletTransactions(w.id);
        setTransactions(tx);
      }
      setLoading(false);
    }
    load();
  }, []);

  const types = ["all", "Deposit", "Withdrawal", "Escrow Payment", "Escrow Release", "Refund", "Commission"];
  const statuses = ["all", "Pending", "Processing", "Completed", "Cancelled", "Failed"];

  const filtered = transactions.filter(function (t) {
    const q = search.toLowerCase();
    const matchSearch = !q || t.reference.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
    const matchType = typeFilter === "all" || t.transaction_type === typeFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="w-10 h-10 border-[3px] border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#2e8b5a] to-[#1a4731] text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-green-300 text-xs font-black uppercase tracking-widest mb-2">Kora Wallet</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h1 className="text-3xl font-black">Your Wallet</h1>
            <Link href="/wallet/withdraw" className="inline-block bg-white text-[#2e8b5a] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition w-fit">
              Withdraw Funds
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Balance cards — live from Supabase */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Balance</p>
            <p className="text-2xl font-black text-[#1a4731]">{formatNaira(wallet?.available_balance || 0)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Balance</p>
            <p className="text-2xl font-black text-yellow-600">{formatNaira(wallet?.pending_balance || 0)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Deposited</p>
            <p className="text-2xl font-black text-gray-800">{formatNaira(wallet?.total_deposit || 0)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Withdrawn</p>
            <p className="text-2xl font-black text-gray-800">{formatNaira(wallet?.total_withdrawal || 0)}</p>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-black text-gray-800 mb-4">Transaction History</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={search}
                onChange={function (e) { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by reference or description..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              />
              <select
                value={typeFilter}
                onChange={function (e) { setTypeFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              >
                {types.map(function (t) { return <option key={t} value={t}>{t === "all" ? "All Types" : t}</option>; })}
              </select>
              <select
                value={statusFilter}
                onChange={function (e) { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              >
                {statuses.map(function (s) { return <option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>; })}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-bold text-gray-600 mb-1">No transactions yet</p>
              <p className="text-sm text-gray-400">Your wallet activity will appear here once you start trading.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="px-5 py-3">Reference</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(function (t) {
                      return (
                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{t.reference}</td>
                          <td className="px-5 py-3.5 font-semibold text-gray-700">{t.transaction_type}</td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">{formatNaira(t.amount)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(t.status)}`}>{t.status}</span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{new Date(t.created_at).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-50">
                {pageItems.map(function (t) {
                  return (
                    <div key={t.id} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{t.transaction_type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(t.status)}`}>{t.status}</span>
                      </div>
                      <p className="text-lg font-black text-gray-900 mb-1">{formatNaira(t.amount)}</p>
                      <p className="text-xs text-gray-400 font-mono">{t.reference}</p>
                      <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-100">
                  <button
                    disabled={page === 1}
                    onClick={function () { setPage(function (p) { return p - 1; }); }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={function () { setPage(function (p) { return p + 1; }); }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}