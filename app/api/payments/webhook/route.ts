// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { fulfillFlutterwavePayment } from "@/lib/payments/fulfill";
import { fulfillB2BPayment } from "@/lib/payments/fulfillB2B";

export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash") || "";
  const expected = process.env.FLUTTERWAVE_SECRET_HASH || "";

  if (!expected || !safeEqual(signature, expected)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const transactionId = String(payload?.data?.id ?? "");
  const txRef = String(payload?.data?.tx_ref || "");

  if (!/^\d{1,20}$/.test(transactionId)) {
    return NextResponse.json({ error: "No valid transaction id in payload." }, { status: 400 });
  }

  const result: any = txRef.startsWith("korab2b_")
    ? await fulfillB2BPayment(transactionId)
    : await fulfillFlutterwavePayment(transactionId);

  if (!result.ok) {
    console.error("Webhook fulfillment failed:", result.reason || "Unknown error");
    // Temporary failures return 500 so Flutterwave retries instead of the payment being lost.
    if (result.retryable) {
      return NextResponse.json({ error: "Temporary failure." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
