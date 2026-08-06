// app/api/wallet/verify-bank/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Flutterwave secret key not configured." }, { status: 500 });
  }

  try {
    const { bankCode, accountNumber } = await req.json();

    if (!bankCode || !/^\d{10}$/.test(String(accountNumber || ""))) {
      return NextResponse.json({ error: "Bank and a valid 10-digit account number are required." }, { status: 400 });
    }

    const res = await fetch("https://api.flutterwave.com/v3/accounts/resolve", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_number: accountNumber,
        account_bank: bankCode,
      }),
    });
    const json = await res.json();

    if (json.status !== "success" || !json.data?.account_name) {
      return NextResponse.json(
        { error: json.message || "Could not verify that account. Check the number and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ accountName: json.data.account_name as string });
  } catch (err: any) {
    console.error("verify-bank route error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}