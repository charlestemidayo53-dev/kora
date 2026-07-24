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
 */
export async function getWalletTransactions(walletId: string): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false });

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

  // Validate against wallet settings
  const settings = await getWalletSettings();
  if (settings) {
    if (amount < settings.minimum_withdrawal) {
      return { success: false, error: `Minimum withdrawal is ₦${settings.minimum_withdrawal.toLocaleString()}` };
    }
    if (amount > settings.maximum_withdrawal) {
      return { success: false, error: `Maximum withdrawal is ₦${settings.maximum_withdrawal.toLocaleString()}` };
    }
  }

  // Validate against available balance
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
 * Format a number as Naira currency.
 */
export function formatNaira(amount: number): string {
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
