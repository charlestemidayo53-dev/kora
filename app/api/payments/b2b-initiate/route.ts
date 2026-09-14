import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { milestoneId, accessToken } = await req.json();
    if (!milestoneId || !accessToken) {
      return NextResponse.json({ error: "milestoneId and accessToken are required." }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const user = userData.user;

    const { data: milestone } = await supabase
      .from("b2b_payment_milestones")
      .select("*, b2b_orders(*)")
      .eq("id", milestoneId)
      .single();

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
    }

    if (milestone.b2b_orders.buyer_email !== user.email) {
      return NextResponse.json({ error: "Only the buyer on this deal can pay this milestone." }, { status: 403 });
    }

    if (milestone.status === "confirmed") {
      return NextResponse.json({ error: "This milestone is already paid." }, { status: 400 });
    }

    const txRef = `korab2b_${crypto.randomUUID()}`;

    await supabase
      .from("b2b_payment_milestones")
      .update({ tx_ref: txRef, payment_method: "online" })
      .eq("id", milestoneId);

    return NextResponse.json({
      tx_ref: txRef,
      amount: milestone.amount,
      currency: "NGN",
      customer: { email: user.email, name: user.user_metadata?.full_name || user.email },
    });
  } catch (err: any) {
    console.error("B2B payment initiate error:", err);
    return NextResponse.json({ error: err.message || "Failed to initiate payment." }, { status: 500 });
  }
}
