// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fulfillFlutterwavePayment } from "@/lib/payments/fulfill";
import { fulfillB2BPayment } from "@/lib/payments/fulfillB2B";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash");
  const expected = process.env.FLUTTERWAVE_SECRET_HASH;

  if (!expected || signature !== expected) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = await req.json();
  const transactionId = payload?.data?.id;
  const txRef: string = payload?.data?.tx_ref || "";

  if (!transactionId) {
    return NextResponse.json({ error: "No transaction id in payload." }, { status: 400 });
  }

  const result = txRef.startsWith("korab2b_")
    ? await fulfillB2BPayment(String(transactionId))
    : await fulfillFlutterwavePayment(String(transactionId));

  if (!result.ok) {
    const reason = (result as any).reason || "Unknown error";
    console.error("Webhook fulfillment failed:", reason);
  }

  return NextResponse.json({ received: true });
}
