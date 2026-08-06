"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import {
  getPayoutAccount,
  verifyBankAccount,
  savePayoutAccount,
  type PayoutAccount,
} from "@/lib/wallet";
import { ArrowLeft, CheckCircle2, Landmark } from "lucide-react";

export default function PayoutAccountPage() {
  const [user, setUser] = useState<any>(null);
  const [existing, setExisting] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolved, setResolved] = useState<{ accountName: string; bankCode: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(function () {
    async function load() {
      const currentUser = await getUser();
      if (!currentUser) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(currentUser);
      const acct = await getPayoutAccount(currentUser.id);
      setExisting(acct);
      setEditing(!acct);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(function () {
    fetch("/api/wallet/banks")
      .then((r) => r.json())
      .then((json) => setBanks(json.banks || []))
      .catch(() => setBanks([]));
  }, []);

  async function handleVerify() {
    setError("");
    setResolved(null);
    if (!bankCode || !/^\d{10}$/.test(accountNumber)) {
      setError("Select a bank and enter a 10-digit account number.");
      return;
    }
    setVerifying(true);
    const result = await verifyBankAccount(bankCode, accountNumber);
    setVerifying(false);
    if (!result.success) {
      setError(result.error || "Verification failed.");
      return;
    }
    setResolved({ accountName: result.accountName, bankCode: result.bankCode });
  }

  async function handleSave() {
    if (!resolved || !user) return;
    setSaving(true);
    setError("");
    const result = await savePayoutAccount({
      userId: user.id,
      bankName,
      bankCode: resolved.bankCode,
      accountNumber,
      accountName: resolved.accountName,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error || "Failed to save payout account.");
      return;
    }
    const acct = await getPayoutAccount(user.id);
    setExisting(acct);
    setEditing(false);
    setResolved(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED]">
        <div className="w-10 h-10 border-[3px] border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">

        <Link href="/wallet" className="flex items-center gap-2 text-gray-500 hover:text-[#F97316] transition text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Wallet
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-xl font-black text-gray-900 mb-1">Payout Account</h1>
          <p className="text-sm text-gray-500 mb-6">The bank account your withdrawals are sent to.</p>

          {!editing && existing ? (
            <div>
              <div className="flex items-center gap-3 p-4 bg-[#FFF3E8] rounded-xl mb-5">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <Landmark className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{existing.account_name}</p>
                  <p className="text-xs text-gray-500">{existing.bank_name} · {existing.account_number}</p>
                </div>
              </div>
              <button
                onClick={function () {
                  setEditing(true);
                  setBankCode("");
                  setBankName("");
                  setAccountNumber("");
                }}
                className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
              >
                Replace Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Bank</label>
                <select
                  value={bankCode}
                  onChange={function (e) {
                    const code = e.target.value;
                    setBankCode(code);
                    const found = banks.find((b) => b.code === code);
                    setBankName(found ? found.name : "");
                    setResolved(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="">Select your bank…</option>
                  {banks.map(function (b) { return <option key={b.code} value={b.code}>{b.name}</option>; })}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Account Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChange={function (e) { setAccountNumber(e.target.value.replace(/\D/g, "")); setResolved(null); }}
                  placeholder="0123456789"
                  className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              {resolved ? (
                <div className="flex items-center gap-2 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-green-700 font-bold">{resolved.accountName}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full border-2 border-[#F97316] text-[#F97316] py-3 rounded-xl font-bold text-sm hover:bg-[#FFF3E8] transition disabled:opacity-50"
                >
                  {verifying ? "Verifying…" : "Verify Account"}
                </button>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {resolved && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#F97316] hover:bg-[#c2410c] disabled:bg-gray-200 text-white py-3.5 rounded-xl font-black text-sm transition"
                >
                  {saving ? "Saving…" : "Save Payout Account"}
                </button>
              )}

              {existing && (
                <button
                  type="button"
                  onClick={function () { setEditing(false); setError(""); setResolved(null); }}
                  className="w-full text-sm font-semibold text-gray-500 hover:text-gray-700 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}