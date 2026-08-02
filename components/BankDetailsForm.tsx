"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Bank = { id: number; code: string; name: string };

export default function BankDetailsForm() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.email) return;
      const { data } = await supabase
        .from("profiles")
        .select("bank_code, bank_account_number, bank_account_name")
        .eq("email", userData.user.email)
        .single();
      if (data) {
        setBankCode(data.bank_code || "");
        setAccountNumber(data.bank_account_number || "");
        setAccountName(data.bank_account_name || "");
      }
    }
    loadExisting();

    async function loadBanks() {
      try {
        const res = await fetch("/api/flutterwave/banks");
        const result = await res.json();
        if (res.ok) setBanks(result.banks || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadBanks();
  }, []);

  async function handleVerify() {
    setError("");
    setAccountName("");
    if (!bankCode || accountNumber.length < 10) {
      setError("Select a bank and enter a valid 10-digit account number.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/flutterwave/resolve-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber, account_bank: bankCode }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Could not verify account.");
        return;
      }
      setAccountName(result.account_name);
    } finally {
      setVerifying(false);
    }
  }

  async function handleSave() {
    if (!accountName) {
      setError("Verify the account before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.email) throw new Error("Not logged in");

      const bankName = banks.find((b) => b.code === bankCode)?.name || "";

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          bank_code: bankCode,
          bank_name: bankName,
          bank_account_number: accountNumber,
          bank_account_name: accountName,
        })
        .eq("email", userData.user.email);

      if (updateErr) throw updateErr;
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Could not save bank details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-[#1a4731] mb-1">Payout Bank Details</h2>
      <p className="text-sm text-gray-500 mb-5">
        Add your bank account so Kora can pay you automatically when a buyer confirms delivery.
      </p>

      <label className="block text-xs font-semibold text-gray-600 mb-1">Bank</label>
      <select
        value={bankCode}
        onChange={(e) => {
          setBankCode(e.target.value);
          setAccountName("");
        }}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4"
      >
        <option value="">Select your bank</option>
        {banks.map((b) => (
          <option key={b.id} value={b.code}>
            {b.name}
          </option>
        ))}
      </select>

      <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number</label>
      <input
        value={accountNumber}
        onChange={(e) => {
          setAccountNumber(e.target.value.replace(/\D/g, ""));
          setAccountName("");
        }}
        maxLength={10}
        placeholder="0123456789"
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3"
      />

      <button
        onClick={handleVerify}
        disabled={verifying}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold mb-4 disabled:opacity-50"
      >
        {verifying ? "Verifying..." : "Verify Account"}
      </button>

      {accountName && (
        <div className="bg-[#f0faf4] border border-[#c8e6d4] text-[#2e8b5a] rounded-xl px-3 py-2.5 text-sm font-semibold mb-4">
          Account Name: {accountName}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2.5 text-sm mb-4">
          {error}
        </div>
      )}

      {saved && !error && (
        <div className="bg-[#f0faf4] border border-[#c8e6d4] text-[#2e8b5a] rounded-xl px-3 py-2.5 text-sm mb-4">
          Bank details saved.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !accountName}
        className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 text-white py-2.5 rounded-xl text-sm font-semibold"
      >
        {saving ? "Saving..." : "Save Bank Details"}
      </button>
    </div>
  );
}