// app/api/payments/b2b-initiate/route.ts
// SERVER ONLY. Only the buyer on a deal can start an online payment for one of its pending milestones.
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const DEFAULT_ONLINE_LIMIT_NGN = 5000000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getOnlineLimit(admin: ReturnType<typeof getSupabaseAdmin>): Promise<number> {
  const { data, error } = await admin
    .from("platform_settings")
    .select("value")
    .eq("key", "online_checkout_limit_ngn")
    .maybeSingle();
  const parsed = Number(data?.value);
  if (error || !Number.isFinite(parsed) || parsed <= 0) return DEFAULT_ONLINE_LIMIT_NGN;
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization") || "");
    const token = (bearer?.[1] || (typeof body?.accessToken === "string" ? body.accessToken : "")).trim();
    if (!token) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user?.email) {
      return NextResponse.json({ error: "Please sign in again to continue." }, { status: 401 });
    }

    const milestoneId = String(body?.milestoneId ?? "");
    if (!UUID_RE.test(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone." }, { status: 400 });
    }

    const { data: milestone, error: milestoneError } = await admin
      .from("b2b_payment_milestones")
      .select("id, b2b_order_id, amount, status")
      .eq("id", milestoneId)
      .maybeSingle();
    if (milestoneError) throw milestoneError;
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
    }

    const { data: order, error: orderError } = await admin
      .from("b2b_orders")
      .select("id, buyer_email")
      .eq("id", milestone.b2b_order_id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || String(order.buyer_email || "").toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Only the buyer on this deal can pay this milestone." }, { status: 403 });
    }

    if (milestone.status !== "pending") {
      return NextResponse.json({ error: "This milestone cannot be paid online right now." }, { status: 400 });
    }

    const amount = Number(milestone.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "This milestone has no valid amount." }, { status: 400 });
    }

    const limit = await getOnlineLimit(admin);
    if (amount > limit) {
      return NextResponse.json(
        { error: "This payment is above the online checkout limit. Please pay by bank transfer and submit your transfer reference." },
        { status: 400 }
      );
    }

    const txRef = `korab2b_${crypto.randomUUID()}`;

    const { error: updateError } = await admin
      .from("b2b_payment_milestones")
      .update({ tx_ref: txRef, payment_method: "online" })
      .eq("id", milestone.id)
      .eq("status", "pending");
    if (updateError) throw updateError;

    return NextResponse.json({
      tx_ref: txRef,
      amount,
      currency: "NGN",
      customer: { email: user.email, name: user.user_metadata?.full_name || user.email },
    });
  } catch (err) {
    console.error("B2B payment initiate error:", err);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }
}
