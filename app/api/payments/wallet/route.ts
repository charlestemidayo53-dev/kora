// app/api/wallet/banks/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Flutterwave secret key not configured." }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.flutterwave.com/v3/banks/NG", {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    const json = await res.json();

    if (json.status !== "success") {
      return NextResponse.json({ error: "Could not load bank list." }, { status: 502 });
    }

    const banks = (json.data || [])
      .map((b: any) => ({ name: b.name as string, code: b.code as string }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json({ banks });
  } catch (err: any) {
    console.error("banks route error:", err);
    return NextResponse.json({ error: "Could not load bank list." }, { status: 500 });
  }
}