// app/api/quote-request/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  // Same-origin requests only.
  const origin = req.headers.get("origin");
  if (origin) {
    let originHost = "";
    try { originHost = new URL(origin).host; } catch { originHost = ""; }
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (!originHost || originHost !== host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const productId = clean(body?.productId, 40);
  const quantity = clean(body?.quantity, 60);
  const location = clean(body?.location, 120);
  const message = clean(body?.message, 1000);

  if (!UUID_RE.test(productId)) return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  if (!quantity) return NextResponse.json({ error: "Please enter the quantity you need." }, { status: 400 });

  // Uses the signed-in user's own session (anon key + cookies), so database RLS still applies.
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes may be unavailable in some server contexts.
          }
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Please log in to request a quote." }, { status: 401 });

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, category, unit, owner")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  if (!product.owner) {
    return NextResponse.json({ error: "This listing cannot receive direct quote requests yet." }, { status: 422 });
  }
  if (String(product.owner).toLowerCase() === user.email.toLowerCase()) {
    return NextResponse.json({ error: "You cannot request a quote on your own product." }, { status: 400 });
  }

  // Simple abuse limit: at most 5 requests per 10 minutes per buyer.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count, error: rateError } = await supabase
    .from("rfqs")
    .select("id", { count: "exact", head: true })
    .eq("buyer", user.email)
    .gte("created_at", since);
  if (rateError) console.error("Quote rate check failed:", rateError.message);
  else if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });
  }

  const base =
    "Buyer requested " + quantity + (product.unit ? " " + product.unit : "") + " of " + product.name +
    (location ? " for delivery to " + location : "") + ".";
  const description = message ? base + " Note: " + message : base;

  const { error } = await supabase
    .from("rfqs")
    .insert([{
      title: "Request: " + product.name,
      description,
      category: product.category,
      quantity,
      budget: "",
      deadline: null,
      urgency: "medium",
      buyer: user.email,
      responses: 0,
      status: "open",
      product_id: product.id,
      target_seller_email: product.owner,
    }])
    .select("id")
    .single();

  if (error) {
    console.error("Quote request insert failed:", error.message);
    return NextResponse.json({ error: "Could not send your request. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}