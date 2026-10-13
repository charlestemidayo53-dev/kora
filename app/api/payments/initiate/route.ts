// app/api/payments/initiate/route.ts
// SERVER ONLY. Price, quantity, fees and limits are all computed here, never trusted from the browser.
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const PLATFORM_COMMISSION_RATE = 0.02; // Kora's 2%, added on top of the seller's price
const DEFAULT_ONLINE_LIMIT_NGN = 5000000; // used only if platform_settings cannot be read
const MAX_QUANTITY = 1000000;
const MAX_INITIATED_PER_HOUR = 15;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

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
    const buyerEmail = user.email;

    const productId = String(body?.productId ?? "");
    if (!UUID_RE.test(productId)) {
      return NextResponse.json({ error: "This product cannot be ordered online." }, { status: 400 });
    }

    const rawQty = body?.quantity === undefined ? 1 : Number(body.quantity);
    if (!Number.isFinite(rawQty) || rawQty <= 0 || rawQty > MAX_QUANTITY) {
      return NextResponse.json({ error: "Please enter a valid quantity." }, { status: 400 });
    }
    const qty = Math.round(rawQty * 1000) / 1000;

    const { data: product, error: productError } = await admin
      .from("products")
      .select("id, name, price, owner, quantity, listing_source, is_claimed")
      .eq("id", productId)
      .maybeSingle();
    if (productError) throw productError;
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    if (!product.owner || (product.listing_source === "discovered" && !product.is_claimed)) {
      return NextResponse.json(
        { error: "This listing is not open for online orders yet. Please use Send Inquiry or Chat with Supplier." },
        { status: 400 }
      );
    }

    if (String(product.owner).toLowerCase() === buyerEmail.toLowerCase()) {
      return NextResponse.json({ error: "You cannot buy your own product." }, { status: 400 });
    }

    const unitPrice = Number(product.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return NextResponse.json({ error: "This product has no valid price set." }, { status: 400 });
    }

    const available = parseFloat(String(product.quantity ?? "").replace(/,/g, ""));
    if (Number.isFinite(available)) {
      if (available <= 0) {
        return NextResponse.json({ error: "This product is out of stock." }, { status: 400 });
      }
      if (qty > available) {
        return NextResponse.json({ error: `Only ${available} available. Please lower the quantity.` }, { status: 400 });
      }
    }

    // Seller gets their full listed price; Kora's fee is added on top and charged to the buyer.
    const sellerAmount = round2(unitPrice * qty);
    const commissionAmount = round2(Math.round(sellerAmount * PLATFORM_COMMISSION_RATE));
    const buyerTotal = round2(sellerAmount + commissionAmount);

    const limit = await getOnlineLimit(admin);
    const limitText = "\u20A6" + limit.toLocaleString("en-US");
    if (buyerTotal > limit) {
      return NextResponse.json(
        { error: `This order is above the ${limitText} online checkout limit. Please use Send Inquiry or Post a Buying Request to arrange a high-value order with the supplier.` },
        { status: 400 }
      );
    }

    // Abuse limits: too many open attempts, or splitting one purchase across several payments to dodge the limit.
    const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: recent, error: recentError } = await admin
      .from("payments")
      .select("amount, seller, status, created_at")
      .eq("buyer_email", buyerEmail)
      .gte("created_at", since24h)
      .limit(200);
    if (recentError) throw recentError;

    const oneHourAgo = Date.now() - 3600 * 1000;
    const initiatedLastHour = (recent || []).filter(
      (p: any) => p.status === "initiated" && new Date(p.created_at).getTime() > oneHourAgo
    ).length;
    if (initiatedLastHour >= MAX_INITIATED_PER_HOUR) {
      return NextResponse.json({ error: "Too many payment attempts. Please try again later." }, { status: 429 });
    }

    const paidToSameSeller = (recent || [])
      .filter((p: any) => p.status === "success" && String(p.seller || "").toLowerCase() === String(product.owner).toLowerCase())
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    if (paidToSameSeller + buyerTotal > limit) {
      return NextResponse.json(
        { error: `Orders to the same supplier within 24 hours are limited to ${limitText} online. Please arrange a high-value order instead.` },
        { status: 400 }
      );
    }

    const txRef = `kora_${crypto.randomUUID()}`;

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert([{
        product_id: product.id,
        product_name: product.name,
        buyer: buyerEmail,
        seller: product.owner,
        amount: buyerTotal,
        seller_amount: sellerAmount,
        commission_amount: commissionAmount,
        quantity: qty,
        status: "pending",
        payment_status: "pending",
        tx_ref: txRef,
      }])
      .select("id")
      .single();
    if (orderError) throw orderError;

    const { error: paymentError } = await admin.from("payments").insert([{
      tx_ref: txRef,
      product_id: product.id,
      product_name: product.name,
      buyer_email: buyerEmail,
      seller: product.owner,
      amount: buyerTotal,
      seller_amount: sellerAmount,
      commission_amount: commissionAmount,
      currency: "NGN",
      status: "initiated",
      order_id: order.id,
    }]);
    if (paymentError) {
      await admin.from("orders").delete().eq("id", order.id);
      throw paymentError;
    }

    return NextResponse.json({
      tx_ref: txRef,
      amount: buyerTotal,
      seller_amount: sellerAmount,
      commission_amount: commissionAmount,
      currency: "NGN",
      customer: {
        email: buyerEmail,
        name: user.user_metadata?.full_name || buyerEmail,
      },
    });
  } catch (err) {
    console.error("Payment initiate error:", err);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }
}
