"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import {
  getOrCreateWallet,
  getWalletTransactions,
  getSellerWalletStats,
  getSellerOrderStats,
  getWalletMonthlySummary,
  formatNaira,
  statusColor,
  type Wallet,
  type WalletTransaction,
  type SellerWalletStats,
  type SellerOrderStats,
  type MonthlySummaryPoint,
} from "@/lib/wallet";
import {
  Wallet as WalletIcon,
  Hourglass,
  TrendingUp,
  Landmark,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  BanknoteIcon,
  History,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const RECENT_TX_LIMIT = 5;

function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short" });
}

export default function WalletPage() {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [stats, setStats] = useState<SellerWalletStats | null>(null);
  const [orderStats, setOrderStats] = useState<SellerOrderStats | null>(null);
  const [chartData, setChartData] = useState<MonthlySummaryPoint[]>([]);
  const [recentTx, setRecentTx] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

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

      const [s, os, chart] = await Promise.all([
        getSellerWalletStats(currentUser.id),
        getSellerOrderStats(currentUser.id),
        getWalletMonthlySummary(currentUser.id, 6),
      ]);
      setStats(s);
      setOrderStats(os);
      setChartData(chart);

      if (w) {
        const tx = await getWalletTransactions(w.id, RECENT_TX_LIMIT);
        setRecentTx(tx);
      }

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED]">
        <div className="w-10 h-10 border-[3px] border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const successRate = orderStats && orderStats.total_orders > 0
    ? ((orderStats.successful_orders / orderStats.total_orders) * 100).toFixed(1)
    : "0.0";
  const pendingRate = orderStats && orderStats.total_orders > 0
    ? ((orderStats.pending_orders / orderStats.total_orders) * 100).toFixed(1)
    : "0.0";
  const cancelledRate = orderStats && orderStats.total_orders > 0
    ? ((orderStats.cancelled_orders / orderStats.total_orders) * 100).toFixed(1)
    : "0.0";

  const chart = chartData.map((p) => ({
    month: monthLabel(p.month_start),
    Earnings: p.earnings,
    Withdrawals: p.withdrawals,
  }));

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Wallet</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your earnings, withdrawals and transactions</p>
          </div>
          <Link
            href="/wallet/withdraw"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#c2410c] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition w-fit"
          >
            <BanknoteIcon className="w-4 h-4" />
            Withdraw Funds
          </Link>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-[#F97316] uppercase tracking-wide">Available Balance</p>
              <div className="w-8 h-8 rounded-lg bg-[#FFF3E8] flex items-center justify-center">
                <WalletIcon className="w-4 h-4 text-[#F97316]" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{formatNaira(wallet?.available_balance)}</p>
            <p className="text-xs text-gray-400 mt-1">Ready for withdrawal</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending Balance</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Hourglass className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{formatNaira(wallet?.pending_balance)}</p>
            <p className="text-xs text-gray-400 mt-1">From {orderStats?.pending_orders ?? 0} orders</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lifetime Earnings</p>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{formatNaira(stats?.total_earnings)}</p>
            <p className="text-xs text-gray-400 mt-1">All-time, after commission</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Withdrawn</p>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Landmark className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{formatNaira(wallet?.total_withdrawal)}</p>
            <p className="text-xs text-gray-400 mt-1">Total amount withdrawn</p>
          </div>
        </div>

        {/* Order stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFF3E8] flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-[#F97316]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-lg font-black text-gray-900">{orderStats?.total_orders ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Successful</p>
              <p className="text-lg font-black text-gray-900">{orderStats?.successful_orders ?? 0}
                <span className="text-xs font-medium text-gray-400 ml-1">{successRate}%</span>
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-black text-gray-900">{orderStats?.pending_orders ?? 0}
                <span className="text-xs font-medium text-gray-400 ml-1">{pendingRate}%</span>
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cancelled</p>
              <p className="text-lg font-black text-gray-900">{orderStats?.cancelled_orders ?? 0}
                <span className="text-xs font-medium text-gray-400 ml-1">{cancelledRate}%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Chart + quick actions */}
        <div className="grid lg:grid-cols-3 gap-5 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Wallet Overview</h2>
              <span className="text-xs text-gray-400">Last 6 months</span>
            </div>
            {chart.length === 0 || chart.every((c) => c.Earnings === 0 && c.Withdrawals === 0) ? (
              <div className="h-56 flex items-center justify-center text-sm text-gray-400">
                No wallet activity yet
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ef" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => "₦" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                    <Tooltip formatter={(v: number) => formatNaira(v)} />
                    <Line type="monotone" dataKey="Earnings" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Withdrawals" stroke="#9ca3af" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-1">
              {[
                { label: "Withdraw Funds", sub: "Transfer money to your bank account", href: "/wallet/withdraw", Icon: BanknoteIcon, bg: "bg-[#FFF3E8]", color: "text-[#F97316]" },
                { label: "Bank Details", sub: "Manage your payout account", href: "/wallet/payout-account", Icon: Landmark, bg: "bg-blue-50", color: "text-blue-600" },
                { label: "Transaction History", sub: "View all wallet transactions", href: "/wallet/transactions", Icon: History, bg: "bg-purple-50", color: "text-purple-600" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition group"
                >
                  <div className={"w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 " + action.bg}>
                    <action.Icon className={"w-4 h-4 " + action.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                    <p className="text-xs text-gray-400">{action.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Recent Transactions</h2>
            <Link href="/wallet/transactions" className="text-sm font-bold text-[#F97316] hover:text-[#c2410c] transition flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTx.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-gray-400">No transactions yet. Activity will appear here once you start trading.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTx.map((t) => {
                      const isCredit = t.transaction_type === "Escrow Release" || t.transaction_type === "Escrow Payment";
                      return (
                        <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                          <td className="px-5 py-3.5 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 font-semibold text-gray-700">{t.transaction_type}</td>
                          <td className="px-5 py-3.5 text-gray-500">{t.description || "—"}</td>
                          <td className={"px-5 py-3.5 font-bold " + (isCredit ? "text-green-600" : "text-gray-900")}>
                            {isCredit ? "+" : "-"}{formatNaira(t.amount)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(t.status)}`}>{t.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-50">
                {recentTx.map((t) => {
                  const isCredit = t.transaction_type === "Escrow Release" || t.transaction_type === "Escrow Payment";
                  return (
                    <div key={t.id} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{t.transaction_type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(t.status)}`}>{t.status}</span>
                      </div>
                      <p className={"text-lg font-black mb-1 " + (isCredit ? "text-green-600" : "text-gray-900")}>
                        {isCredit ? "+" : "-"}{formatNaira(t.amount)}
                      </p>
                      <p className="text-xs text-gray-400">{t.description}</p>
                      <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Trust footer — this is copy, not a status, so it stays on-brand orange rather than green */}
        <div className="bg-[#FFF3E8] border border-[#FDBA8C] rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#F97316] flex-shrink-0" />
            <p className="text-sm text-[#c2410c]">
              <span className="font-bold">Your funds are secure with Kora.</span> Payments are processed securely and released once orders are confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}