import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "./config";
import { productIsIndexable, type SeoProduct } from "./product";
import { idPrefixFromSlug, uuidRange } from "./slug";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

// Public display names only: anything containing "@" is treated as missing.
function publicName(v: unknown): string | null {
  const t = clean(v);
  return t && !t.includes("@") ? t : null;
}

function toAbsolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return "https:" + url;
  const path = url.startsWith("/") ? url : "/" + url;
  return SITE_URL + (/%[0-9a-f]{2}/i.test(path) ? path : encodeURI(path));
}

function parsePrice(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mapProduct(row: Record<string, any>): SeoProduct | null {
  const name = clean(row.name);
  if (!row.id || !name) return null;

  const rawImages: string[] = Array.isArray(row.images)
    ? row.images.filter(function (x: unknown) { return typeof x === "string" && x.trim(); })
    : [];
  if (typeof row.image === "string" && row.image.trim()) rawImages.unshift(row.image.trim());
  const images = Array.from(new Set(rawImages.map(toAbsolute)));

  const moqRaw = row.minimum_order_quantity ?? row.moq;
  const av = row.availability;

  return {
    id: String(row.id),
    name,
    description: clean(row.description),
    images,
    category: clean(row.category),
    subcategory: clean(row.subcategory),
    place: clean(row.state) || clean(row.city) || clean(row.location),
    price: parsePrice(row.price),
    unit: clean(row.unit),
    moq: moqRaw === null || moqRaw === undefined || moqRaw === "" ? null : String(moqRaw),
    seller: publicName(row.seller),
    isVerified: Boolean(row.is_verified),
    brand: clean(row.brand),
    createdAt: clean(row.created_at),
    listingSource: clean(row.listing_source),
    isEstimatedPrice: Boolean(row.is_estimated_price),
    availability: av === "available" || av === "limited" || av === "unavailable" ? av : null,
  };
}

export const getProductSeoBySlug = cache(async function (slug: string): Promise<SeoProduct | null> {
  const prefix = idPrefixFromSlug(slug);
  if (!prefix) return null;
  const range = uuidRange(prefix);
  const { data, error } = await db()
    .from("products")
    .select("*")
    .gte("id", range.min)
    .lte("id", range.max)
    .limit(1);
  if (error) {
    console.error("SEO product lookup failed:", error.message);
    return null;
  }
  return data && data.length ? mapProduct(data[0]) : null;
});

export const getProductSeoById = cache(async function (id: string): Promise<SeoProduct | null> {
  const { data, error } = await db().from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapProduct(data);
});

export async function getRelatedProducts(product: SeoProduct, limit = 8): Promise<SeoProduct[]> {
  if (!product.category) return [];
  const { data, error } = await db()
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .limit(24);
  if (error || !data) return [];
  return data
    .map(mapProduct)
    .filter(function (p): p is SeoProduct { return p !== null && productIsIndexable(p); })
    .slice(0, limit);
}

export async function getIndexableProductsForSitemap(): Promise<SeoProduct[]> {
  const out: SeoProduct[] = [];
  const PAGE = 1000;
  for (let from = 0; from < 50000; from += PAGE) {
    const { data, error } = await db()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    data.forEach(function (row) {
      const p = mapProduct(row);
      if (p && productIsIndexable(p)) out.push(p);
    });
    if (data.length < PAGE) break;
  }
  return out;
}