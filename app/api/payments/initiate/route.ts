// app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getProductById } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { productId, accessToken } = await req.json();

    if (!productId || !accessToken) {
      return NextResponse.json(
        { error: "productId and accessToken are required." },
        { status: 400 }
      );
    }

    // Validate the buyer's session server-side — never trust a client-sent
    // email/name for who's paying.
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const user = userData.user;

    // Re-fetch the product server-side — the amount charged is always the
    // current DB price, never a value the client could have sent us.
    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    if (user.email === product.owner) {
      return NextResponse.json(
        { error: "You cannot buy your own product." },
        { status: 400 }
      );
    }

    const amount = Number(product.price);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "This product has no valid price set." },
        { status: 400 }
      );
    }

    const txRef = `kora_${crypto.randomUUID()}`;

    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert([
        {
          tx_ref: txRef,
          product_id: product.id,
          product_name: product.name,
          buyer_email: user.email,
          seller: product.owner,
          amount,
          currency: "NGN",
          status: "initiated",
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      tx_ref: payment.tx_ref,
      amount: payment.amount,
      currency: payment.currency,
      customer: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      },
    });
  } catch (err: any) {
    console.error("Payment initiate error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate payment." },
      { status: 500 }
    );
  }
}