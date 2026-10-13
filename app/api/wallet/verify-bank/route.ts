// app/api/wallet/verify-bank/route.ts
// SERVER ONLY. Signed-in users only: this spends Flutterwave API calls and reveals account holder names.
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_LOOKUPS_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_LOOKUPS_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    console.error("verify-bank: FLUTTERWAVE_SECRET_KEY is not configured.");
    return NextResponse.json({ error: "Bank verification is unavailable right now." }, { status: 500 });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in to verify a bank account." }, { status: 401 });
  }

  if (isRateLimited(user.id)) {
    return NextResponse.json({ error: "Too many lookups. Please wait a few minutes and try again." }, { status: 429 });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const bankCode = String(body?.bankCode ?? "").trim();
    const accountNumber = String(body?.accountNumber ?? "").trim();

    if (!/^[0-9A-Za-z]{2,10}$/.test(bankCode) || !/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json({ error: "Bank and a valid 10-digit account number are required." }, { status: 400 });
    }

    const res = await fetch("https://api.flutterwave.com/v3/accounts/resolve", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account_number: accountNumber, account_bank: bankCode }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));

    if (json?.status !== "success" || !json?.data?.account_name) {
      return NextResponse.json(
        { error: "Could not verify that account. Check the number and bank and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ accountName: String(json.data.account_name) });
  } catch (err) {
    console.error("verify-bank route error:", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
