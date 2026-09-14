import { NextRequest, NextResponse } from "next/server";
import { fulfillB2BPayment } from "@/lib/payments/fulfillB2B";

export async function POST(req: NextRequest) {
  try {
    const { transaction_id } = await req.json();
    if (!transaction_id) {
      return NextResponse.json({ error: "transaction_id is required." }, { status: 400 });
    }

    const result = await fulfillB2BPayment(String(transaction_id));

    if (!result.ok) {
      return NextResponse.json({ error: (result as any).reason }, { status: 400 });
    }

    return NextResponse.json({ success: true, milestone: result.milestone });
  } catch (err: any) {
    console.error("B2B payment verify error:", err);
    return NextResponse.json({ error: err.message || "Verification failed." }, { status: 500 });
  }
}
