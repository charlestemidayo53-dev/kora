// lib/wallet.ts
// Shared wallet functions — every call here hits real Supabase data.
// No mock balances, no fake transactions.

import { supabase } from "@/lib/supabase";

export type Wallet = {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  total_deposit: number;
  total_withdrawal: number;
  created_at: string;
  updated_at: string;
};

export type WalletTransaction = {
  id: string;
  wallet_id: string;
  reference: string;
  amount: number;
  transaction_type: "Deposit" | "Withdrawal" | "Escrow Payment" | "Escrow Release" | "Refund" | "Commission";
  status: "Pending" | "Processing" | "Completed" | "Cancelled" | "Failed";
  description: string | null;
  created_at: string;
};

export type WithdrawalRequest = {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  status: "Pending" | "Completed" | "Rejected";
  approved_by: string | null;
  created_at: string;
};

export type WalletSettings = {
  id: string;
  minimum_withdrawal: number;
  maximum_withdrawal: number;
  withdrawal_fee: number;
  daily_limit: number;
  updated_at: string;
};

export type PayoutAccount = {
  id: string;
  user_id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  created_at: string;
  updated_at: string;
};

// NOTE: these three are derived from wallet_transactions as an approximation
// (no separate `orders` table wired in yet). Swap the queries below if/when
// you have a real orders table you want these tied to instead.
export type SellerWalletStats = {
  total_earnings: number;
};

export type SellerOrderStats = {
  total_orders: number;
  successful_orders: number;
  pending_orders: number;
  cancelled_orders: number;
};

export type MonthlySummaryPoint = {
  month_start: string; // ISO date, first of month
  earnings: number;
  withdrawals: number;
};

/**
 * Get (or lazily create) a wallet row for a user.
 * Every new user starts at zero — no fake starting balance.
 */
export async function getOrCreateWallet(userId: string): Promise<Wallet | null> {
  const { data: existing, error: fetchError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.error("getOrCreateWallet fetch error:", fetchError);
    return null;
  }

  if (existing) return existing as Wallet;

  const { data: created, error: createError } = await supabase
    .from("wallets")
    .insert({ user_id: userId })
    .select()
    .single();

  if (createError) {
    console.error("getOrCreateWallet create error:", createError);
    return null;
  }

  return created as Wallet;
}

/**
 * Fetch a user's transaction history, newest first.
 * Pass `limit` to cap how many rows come back (e.g. for a "recent" widget).
 */
export async function getWalletTransactions(walletId: string, limit?: number): Promise<WalletTransaction[]> {
  let query = supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getWalletTransactions error:", error);
    return [];
  }
  return (data || []) as WalletTransaction[];
}

/**
 * Fetch a user's withdrawal request history, newest first.
 */
export async function getUserWithdrawals(userId: string): Promise<WithdrawalRequest[]> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserWithdrawals error:", error);
    return [];
  }
  return (data || []) as WithdrawalRequest[];
}

/**
 * Fetch the single wallet_settings row (min/max withdrawal, fee, daily limit).
 */
export async function getWalletSettings(): Promise<WalletSettings | null> {
  const { data, error } = await supabase
    .from("wallet_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getWalletSettings error:", error);
    return null;
  }
  return data as WalletSettings | null;
}

/**
 * Generate a unique-looking reference for a transaction.
 */
export function generateReference(prefix: string = "TXN"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Submit a withdrawal request. Does NOT deduct the wallet —
 * stays Pending until an admin approves it.
 */
export async function submitWithdrawalRequest(params: {
  userId: string;
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
}): Promise<{ success: boolean; error?: string }> {
  const { userId, amount, bankName, accountName, accountNumber } = params;

  const settings = await getWalletSettings();
  if (settings) {
    if (amount < settings.minimum_withdrawal) {
      return { success: false, error: `Minimum withdrawal is ₦${settings.minimum_withdrawal.toLocaleString()}` };
    }
    if (amount > settings.maximum_withdrawal) {
      return { success: false, error: `Maximum withdrawal is ₦${settings.maximum_withdrawal.toLocaleString()}` };
    }
  }

  const wallet = await getOrCreateWallet(userId);
  if (!wallet) {
    return { success: false, error: "Could not load wallet." };
  }
  if (amount > wallet.available_balance) {
    return { success: false, error: "Insufficient available balance." };
  }

  const { error } = await supabase.from("withdrawal_requests").insert({
    user_id: userId,
    amount,
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
    status: "Pending",
  });

  if (error) {
    console.error("submitWithdrawalRequest error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get the user's saved payout (bank) account, if any.
 */
export async function getPayoutAccount(userId: string): Promise<PayoutAccount | null> {
  const { data, error } = await supabase
    .from("payout_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getPayoutAccount error:", error);
    return null;
  }
  return data as PayoutAccount | null;
}

/**
 * Resolve an account number to an account name via our server-side
 * Flutterwave route (secret key never touches the browser).
 */
export async function verifyBankAccount(
  bankCode: string,
  accountNumber: string
): Promise<{ success: boolean; accountName: string; bankCode: string; error?: string }> {
  try {
    const res = await fetch("/api/wallet/verify-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankCode, accountNumber }),
    });
    const json = await res.json();

    if (!res.ok || !json.accountName) {
      return { success: false, accountName: "", bankCode, error: json.error || "Verification failed." };
    }

    return { success: true, accountName: json.accountName, bankCode };
  } catch (err) {
    console.error("verifyBankAccount error:", err);
    return { success: false, accountName: "", bankCode, error: "Verification failed. Try again." };
  }
}

/**
 * Save (upsert) the user's payout account.
 */
export async function savePayoutAccount(params: {
  userId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<{ success: boolean; error?: string }> {
  const { userId, bankName, bankCode, accountNumber, accountName } = params;

  const { error } = await supabase.from("payout_accounts").upsert(
    {
      user_id: userId,
      bank_name: bankName,
      bank_code: bankCode,
      account_number: accountNumber,
      account_name: accountName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("savePayoutAccount error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Lifetime earnings, approximated from Escrow Release transactions
 * (i.e. money actually released to the seller).
 */
export async function getSellerWalletStats(userId: string): Promise<SellerWalletStats> {
  const wallet = await getOrCreateWallet(userId);
  if (!wallet) return { total_earnings: 0 };

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("amount")
    .eq("wallet_id", wallet.id)
    .eq("transaction_type", "Escrow Release")
    .eq("status", "Completed");

  if (error) {
    console.error("getSellerWalletStats error:", error);
    return { total_earnings: 0 };
  }

  const total_earnings = (data || []).reduce((sum, t: any) => sum + Number(t.amount || 0), 0);
  return { total_earnings };
}

/**
 * Order-shaped counts, approximated from wallet_transactions:
 * Escrow Payment = order placed, Escrow Release = successful,
 * Pending status = pending, Refund/Failed = cancelled.
 * Replace with real `orders` table queries once you have one wired in.
 */
export async function getSellerOrderStats(userId: string): Promise<SellerOrderStats> {
  const wallet = await getOrCreateWallet(userId);
  if (!wallet) {
    return { total_orders: 0, successful_orders: 0, pending_orders: 0, cancelled_orders: 0 };
  }

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("transaction_type, status")
    .eq("wallet_id", wallet.id)
    .eq("transaction_type", "Escrow Payment");

  if (error) {
    console.error("getSellerOrderStats error:", error);
    return { total_orders: 0, successful_orders: 0, pending_orders: 0, cancelled_orders: 0 };
  }

  const rows = data || [];
  const total_orders = rows.length;
  const successful_orders = rows.filter((r: any) => r.status === "Completed").length;
  const pending_orders = rows.filter((r: any) => r.status === "Pending" || r.status === "Processing").length;
  const cancelled_orders = rows.filter((r: any) => r.status === "Cancelled" || r.status === "Failed").length;

  return { total_orders, successful_orders, pending_orders, cancelled_orders };
}

/**
 * Monthly earnings vs withdrawals for the last `months` months.
 */
export async function getWalletMonthlySummary(userId: string, months: number = 6): Promise<MonthlySummaryPoint[]> {
  const wallet = await getOrCreateWallet(userId);
  if (!wallet) return [];

  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("amount, transaction_type, status, created_at")
    .eq("wallet_id", wallet.id)
    .gte("created_at", since.toISOString());

  if (error) {
    console.error("getWalletMonthlySummary error:", error);
    return [];
  }

  const buckets = new Map<string, { earnings: number; withdrawals: number }>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    buckets.set(key, { earnings: 0, withdrawals: 0 });
  }

  for (const t of data || []) {
    const d = new Date(t.created_at as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const bucket = buckets.get(key);
    if (!bucket) continue;

    if (t.transaction_type === "Escrow Release" && t.status === "Completed") {
      bucket.earnings += Number(t.amount || 0);
    }
    if (t.transaction_type === "Withdrawal" && t.status === "Completed") {
      bucket.withdrawals += Number(t.amount || 0);
    }
  }

  return Array.from(buckets.entries()).map(([month_start, v]) => ({
    month_start,
    earnings: v.earnings,
    withdrawals: v.withdrawals,
  }));
}

/**
 * Format a number as Naira currency.
 */
export function formatNaira(amount: number | null | undefined): string {
  return "₦" + Number(amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/**
 * Status badge color classes, shared across wallet + admin tables.
 */
export function statusColor(status: string): string {
  switch (status) {
    case "Completed": return "bg-green-100 text-green-700 border-green-300";
    case "Processing": return "bg-blue-100 text-blue-700 border-blue-300";
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "Cancelled": return "bg-gray-100 text-gray-600 border-gray-300";
    case "Failed": return "bg-red-100 text-red-700 border-red-300";
    case "Rejected": return "bg-red-100 text-red-700 border-red-300";
    default: return "bg-gray-100 text-gray-600 border-gray-300";
  }
}