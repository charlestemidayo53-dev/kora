// app/api/payments/b2b-verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fulfillB2BPayment } from "@/lib/payments/fulfillB2B";
import { getAuthenticatedUser } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Please sign in again to verify this payment." }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const transactionId = String(body?.transaction_id ?? "").trim();
    if (!/^\d{1,20}$/.test(transactionId)) {
      return NextResponse.json({ error: "A valid transaction_id is required." }, { status: 400 });
    }

    const result: any = await fulfillB2BPayment(transactionId, { expectedBuyerEmail: user.email });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason || "Verification failed." }, { status: 400 });
    }

    const m = result.milestone || {};
    return NextResponse.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      milestone: { id: m.id, status: m.status },
    });
  } catch (err) {
    console.error("B2B payment verify error:", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
