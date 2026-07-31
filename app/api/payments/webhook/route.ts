// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fulfillFlutterwavePayment } from "@/lib/payments/fulfill";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash");
  const expected = process.env.FLUTTERWAVE_SECRET_HASH;

  if (!expected || signature !== expected) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = await req.json();
  const transactionId = payload?.data?.id;

  if (!transactionId) {
    return NextResponse.json({ error: "No transaction id in payload." }, { status: 400 });
  }

  const result = await fulfillFlutterwavePayment(String(transactionId));

  // Flutterwave expects a 200 once we've received and looked at the
  // payload, regardless of outcome — log failures rather than surfacing
  // them as an HTTP error, or Flutterwave will keep retrying indefinitely.
  if (!result.ok) {
    // Cast to any to access the reason property safely for logging
    const reason = (result as any).reason || "Unknown error";
    console.error("Webhook fulfillment failed:", reason);
  }

  return NextResponse.json({ received: true });
}
