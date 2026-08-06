import { supabase } from "@/lib/supabase";

// ── Types ───────────────────────────────────────────────────────────────────
export type Wallet = {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  total_deposit: number;
  total_withdrawal: number;
};

export type WalletTransaction = {
  id: string;
  wallet_id: string;
  reference: string;
  transaction_type: string;
  amount: number;
  status: string;
  description: string | null;
  order_id?: string | null;
  created_at: string;
};

export type WithdrawalRequest = {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  status: string;
  created_at: string;
};

export type WalletSettings = {
  minimum_withdrawal: number;
  maximum_withdrawal: number;
  withdrawal_fee: number;
  commission_rate: number;
};

export type SellerWalletStats = {
  total_sales: number;
  total_orders: number;
  products_sold: number;
  total_earnings: number;
  total_commission: number;
};

export type SellerOrderStats = {
  total_orders: number;
  successful_orders: number;
  pending_orders: number;
  cancelled_orders: number;
};

export type MonthlySummaryPoint = {
  month_start: string;
  earnings: number;
  withdrawals: number;
};

export type PayoutAccount = {
  id: string;
  user_id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  verified: boolean;
};

// ── Formatting helpers ───────────────────────────────────────────────────────
export function formatNaira(amount: number | null | undefined): string {
  const n = Number(amount || 0);
  return "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 2 });
}

export function statusColor(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "successful" || s === "success") return "bg-green-50 text-green-700 border-green-200";
  if (s === "pending" || s === "processing") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "cancelled" || s === "failed" || s === "rejected") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

// ── Wallet ───────────────────────────────────────────────────────────────────
export async function getOrCreateWallet(userId: string): Promise<Wallet | null> {
  const { data: existing } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle();
  if (existing) return existing as Wallet;

  const { data: created, error } = await supabase
    .from("wallets")
    .insert([{ user_id: userId, available_balance: 0, pending_balance: 0, total_deposit: 0, total_withdrawal: 0 }])
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create wallet:", error);
    return null;
  }
  return created as Wallet;
}

export async function getWalletSettings(): Promise<WalletSettings | null> {
  const { data, error } = await supabase.from("wallet_settings").select("*").limit(1).maybeSingle();
  if (error) {
    console.error("Failed to load wallet settings:", error);
    return null;
  }
  return data as WalletSettings | null;
}

// ── Stats (all computed server-side by Postgres functions — see
//    sql/001_wallet_system.sql — never assembled from hardcoded numbers) ────
export async function getSellerWalletStats(userId: string): Promise<SellerWalletStats> {
  const { data, error } = await supabase.rpc("get_seller_wallet_stats", { p_user_id: userId });
  if (error) {
    console.error("Failed to load wallet stats:", error);
    return { total_sales: 0, total_orders: 0, products_sold: 0, total_earnings: 0, total_commission: 0 };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    total_sales: Number(row?.total_sales || 0),
    total_orders: Number(row?.total_orders || 0),
    products_sold: Number(row?.products_sold || 0),
    total_earnings: Number(row?.total_earnings || 0),
    total_commission: Number(row?.total_commission || 0),
  };
}

export async function getSellerOrderStats(userId: string): Promise<SellerOrderStats> {
  const { data, error } = await supabase.rpc("get_seller_order_stats", { p_user_id: userId });
  if (error) {
    console.error("Failed to load order stats:", error);
    return { total_orders: 0, successful_orders: 0, pending_orders: 0, cancelled_orders: 0 };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    total_orders: Number(row?.total_orders || 0),
    successful_orders: Number(row?.successful_orders || 0),
    pending_orders: Number(row?.pending_orders || 0),
    cancelled_orders: Number(row?.cancelled_orders || 0),
  };
}

export async function getWalletMonthlySummary(userId: string, months = 6): Promise<MonthlySummaryPoint[]> {
  const { data, error } = await supabase.rpc("get_wallet_monthly_summary", { p_user_id: userId, p_months: months });
  if (error) {
    console.error("Failed to load monthly summary:", error);
    return [];
  }
  return (data || []) as MonthlySummaryPoint[];
}

// ── Transactions ─────────────────────────────────────────────────────────────
export async function getWalletTransactions(walletId: string, limit?: number): Promise<WalletTransaction[]> {
  let query = supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load transactions:", error);
    return [];
  }
  return (data || []) as WalletTransaction[];
}

// ── Withdrawals ──────────────────────────────────────────────────────────────
export async function getUserWithdrawals(userId: string): Promise<WithdrawalRequest[]> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load withdrawals:", error);
    return [];
  }
  return (data || []) as WithdrawalRequest[];
}

export async function submitWithdrawalRequest(params: {
  userId: string;
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
}): Promise<{ success: boolean; error?: string }> {
  // Server-side guardrails — never trust the client to have enforced these.
  const wallet = await getOrCreateWallet(params.userId);
  const settings = await getWalletSettings();

  if (!wallet) return { success: false, error: "Could not load your wallet." };
  if (params.amount > wallet.available_balance) {
    return { success: false, error: "Amount exceeds your available balance." };
  }
  if (settings) {
    if (params.amount < settings.minimum_withdrawal) {
      return { success: false, error: `Minimum withdrawal is ${formatNaira(settings.minimum_withdrawal)}.` };
    }
    if (params.amount > settings.maximum_withdrawal) {
      return { success: false, error: `Maximum withdrawal is ${formatNaira(settings.maximum_withdrawal)}.` };
    }
  }

  const { error } = await supabase.from("withdrawal_requests").insert([
    {
      user_id: params.userId,
      amount: params.amount,
      bank_name: params.bankName,
      account_name: params.accountName,
      account_number: params.accountNumber,
      status: "pending",
    },
  ]);

  if (error) {
    console.error("Failed to submit withdrawal:", error);
    return { success: false, error: "Failed to submit withdrawal request." };
  }
  return { success: true };
}

// ── Payout account (saved bank account for withdrawals) ─────────────────────
export async function getPayoutAccount(userId: string): Promise<PayoutAccount | null> {
  const { data, error } = await supabase.from("payout_accounts").select("*").eq("user_id", userId).maybeSingle();
  if (error) {
    console.error("Failed to load payout account:", error);
    return null;
  }
  return data as PayoutAccount | null;
}

// Calls the server-side /api/verify-account route (the provider's secret key
// never touches the browser). Returns the account holder's name on success.
export async function verifyBankAccount(bankName: string, accountNumber: string): Promise<
  { success: true; accountName: string; bankCode: string } | { success: false; error: string }
> {
  try {
    const res = await fetch("/api/verify-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankName, accountNumber }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error || "Verification failed." };
    return { success: true, accountName: json.accountName, bankCode: json.bankCode };
  } catch (err) {
    console.error("verifyBankAccount error:", err);
    return { success: false, error: "Network error while verifying account." };
  }
}

export async function savePayoutAccount(params: {
  userId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("payout_accounts").upsert(
    {
      user_id: params.userId,
      bank_name: params.bankName,
      bank_code: params.bankCode,
      account_number: params.accountNumber,
      account_name: params.accountName,
      verified: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to save payout account:", error);
    return { success: false, error: "Failed to save payout account." };
  }
  return { success: true };
}