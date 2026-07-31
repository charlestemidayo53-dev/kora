// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fulfillFlutterwavePayment } from "@/lib/payments/fulfill";

export async function POST(req: NextRequest) {
  try {
    const { transaction_id } = await req.json();

    if (!transaction_id) {
      return NextResponse.json(
        { error: "transaction_id is required." },
        { status: 400 }
      );
    }

    const result = await fulfillFlutterwavePayment(String(transaction_id));

    // Check if the result is NOT ok
    if (!result.ok) {
      // We cast to any or the specific error type to satisfy TypeScript
      // if narrowing is failing.
      const errorMessage = (result as any).reason || "Verification failed.";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Now TypeScript knows result.ok is true
    return NextResponse.json({
      order: result.order,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (err: any) {
    console.error("Payment verify error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed." },
      { status: 500 }
    );
  }
}
