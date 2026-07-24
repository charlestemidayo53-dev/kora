"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import {
  getOrCreateWallet,
  getUserWithdrawals,
  getWalletSettings,
  submitWithdrawalRequest,
  formatNaira,
  statusColor,
  type Wallet,
  type WithdrawalRequest,
  type WalletSettings,
} from "@/lib/wallet";

const nigerianBanks = [
  "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
  "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Globus Bank",
  "Guaranty Trust Bank (GTBank)", "Heritage Bank", "Keystone Bank",
  "Kuda Bank", "Moniepoint MFB", "Opay", "Palmpay", "Polaris Bank",
  "Providus Bank", "Stanbic IBTC Bank", "Standard Chartered Bank",
  "Sterling Bank", "SunTrust Bank", "Union Bank of Nigeria",
  "United Bank for Africa (UBA)", "Unity Bank", "Wema Bank", "Zenith Bank",
];

export default function WithdrawPage() {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [settings, setSettings] = useState<WalletSettings | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

      const s = await getWalletSettings();
      setSettings(s);

      const h = await getUserWithdrawals(currentUser.id);
      setHistory(h);

      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }
    if (!bankName || !accountName || !accountNumber) {
      setError("Please fill in all bank details.");
      return;
    }

    setSubmitting(true);
    const result = await submitWithdrawalRequest({
      userId: user.id,
      amount: amountNum,
      bankName,
      accountName,
      accountNumber,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || "Failed to submit withdrawal request.");
      return;
    }

    setSuccess(true);
    setAmount("");
    setAccountName("");
    setAccountNumber("");
    setBankName("");

    const h = await getUserWithdrawals(user.id);
    setHistory(h);
  }

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
        <div className="max-w-3xl mx-auto">
          <Link href="/wallet" className="text-green-200 text-xs font-bold hover:text-white transition mb-2 inline-block">
            ← Back to Wallet
          </Link>
          <h1 className="text-3xl font-black">Withdraw Funds</h1>
          <p className="text-green-200 text-sm mt-1">Available Balance: {formatNaira(wallet?.available_balance || 0)}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Withdraw form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-[#f0faf4] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-[#1a4731] mb-1">Withdrawal Requested</h2>
              <p className="text-sm text-gray-500 mb-5">Your request is pending admin approval. Your balance has not been deducted yet.</p>
              <button onClick={function () { setSuccess(false); }} className="text-sm font-bold text-[#2e8b5a] hover:underline">
                Request Another Withdrawal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-black text-gray-800 mb-2">Request a Withdrawal</h2>

              {settings && (
                <p className="text-xs text-gray-400 -mt-2">
                  Min {formatNaira(settings.minimum_withdrawal)} · Max {formatNaira(settings.maximum_withdrawal)}
                  {settings.withdrawal_fee > 0 ? ` · Fee ${formatNaira(settings.withdrawal_fee)}` : ""}
                </p>
              )}

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={function (e) { setAmount(e.target.value); }}
                  placeholder="e.g. 50000"
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Bank Name</label>
                <select
                  value={bankName}
                  onChange={function (e) { setBankName(e.target.value); }}
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                >
                  <option value="">Select your bank…</option>
                  {nigerianBanks.map(function (b) { return <option key={b} value={b}>{b}</option>; })}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={function (e) { setAccountName(e.target.value); }}
                    placeholder="As it appears on your bank account"
                    className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={function (e) { setAccountNumber(e.target.value); }}
                    placeholder="0123456789"
                    className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 text-white py-3.5 rounded-2xl font-black text-sm transition"
              >
                {submitting ? "Submitting…" : "Request Withdrawal"}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Your balance is not deducted until an admin approves this request.
              </p>
            </form>
          )}
        </div>

        {/* Withdrawal history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-black text-gray-800">Withdrawal History</h2>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No withdrawal requests yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {history.map(function (w) {
                return (
                  <div key={w.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{formatNaira(w.amount)}</p>
                      <p className="text-xs text-gray-400">{w.bank_name} · {w.account_number}</p>
                      <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(w.status)}`}>{w.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}