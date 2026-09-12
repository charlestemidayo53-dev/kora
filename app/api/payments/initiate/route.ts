import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getProductById, createPendingOrder } from "@/lib/storage";

const PLATFORM_COMMISSION_RATE = 0.02; // Kora's 2%, added on top of the seller's price

export async function POST(req: NextRequest) {
  try {
    const { productId, accessToken, quantity } = await req.json();

    if (!productId || !accessToken) {
      return NextResponse.json(
        { error: "productId and accessToken are required." },
        { status: 400 }
      );
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const user = userData.user;

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

    const unitPrice = Number(product.price);
    if (!unitPrice || unitPrice <= 0) {
      return NextResponse.json(
        { error: "This product has no valid price set." },
        { status: 400 }
      );
    }

    // Seller receives their full listed price. Kora's 2% is added ON TOP,
    // charged to the buyer — never deducted from what the seller is owed.
    const sellerAmount = unitPrice * qty;
    const commissionAmount = Math.round(sellerAmount * PLATFORM_COMMISSION_RATE);
    const buyerTotal = sellerAmount + commissionAmount;

    const txRef = `kora_${crypto.randomUUID()}`;

    const order = await createPendingOrder({
      productId: product.id,
      productName: product.name,
      buyer: user.email,
      seller: product.owner,
      amount: buyerTotal,
      sellerAmount,
      commissionAmount,
      quantity: qty,
      txRef,
    });

    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert([
        {
          tx_ref: txRef,
          product_id: product.id,
          product_name: product.name,
          buyer_email: user.email,
          seller: product.owner,
          amount: buyerTotal,
          seller_amount: sellerAmount,
          commission_amount: commissionAmount,
          currency: "NGN",
          status: "initiated",
          order_id: order.id,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      tx_ref: payment.tx_ref,
      amount: payment.amount,
      seller_amount: payment.seller_amount,
      commission_amount: payment.commission_amount,
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
