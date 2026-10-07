import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL, MIN_CATEGORY_PRODUCTS_TO_INDEX } from "./config";
import { cleanName, productIsIndexable, type SeoProduct } from "./product";
import { idPrefixFromSlug, uuidRange } from "./slug";
import { normalizeCategorySlug, pickCategoryLabel, type CategorySummary } from "./category";
import { supplierKeyFromOwner, supplierSlug, type SupplierSummary } from "./supplier";

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

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;

// Seller-written text can contain contact details. Strip them before anything is published.
export function redactContacts(text: string | null): string | null {
  if (!text) return null;
  const t = text.replace(EMAIL_RE, "").replace(PHONE_RE, "").replace(/\s+/g, " ").trim();
  return t || null;
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
  const name = cleanName(clean(row.name) || "");
  if (!row.id || !name) return null;

  const rawImages: string[] = Array.isArray(row.images)
    ? row.images.filter(function (x: unknown) { return typeof x === "string" && x.trim(); })
    : [];
  if (typeof row.image === "string" && row.image.trim()) rawImages.unshift(row.image.trim());
  const images = Array.from(
    new Set(
      rawImages
        .filter(function (u) { return !/^(data|blob):/i.test(u); })
        .map(toAbsolute),
    ),
  );

  const moqRaw = row.minimum_order_quantity ?? row.moq;
  const av = row.availability;
  const category = clean(row.category);

  return {
    id: String(row.id),
    name,
    description: redactContacts(clean(row.description)),
    images,
    category,
    categorySlug: normalizeCategorySlug(category),
    subcategory: clean(row.subcategory),
    place: clean(row.state) || clean(row.city) || clean(row.location),
    price: parsePrice(row.price),
    unit: clean(row.unit),
    moq: moqRaw === null || moqRaw === undefined || moqRaw === "" ? null : String(moqRaw),
    seller: publicName(row.seller),
    supplierKey: supplierKeyFromOwner(clean(row.owner)),
    isVerified: Boolean(row.is_verified),
    brand: clean(row.brand),
    createdAt: clean(row.created_at),
    listingSource: clean(row.listing_source),
    isEstimatedPrice: Boolean(row.is_estimated_price),
    availability: av === "available" || av === "limited" || av === "unavailable" ? av : null,
  };
}

/* ---------- single product lookups ---------- */

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
  // A database error must not look like "not found" (that would be a 404 for Google).
  if (error) throw new Error("SEO product lookup failed: " + error.message);
  return data && data.length ? mapProduct(data[0]) : null;
});

export const getProductSeoById = cache(async function (id: string): Promise<SeoProduct | null> {
  const { data, error } = await db().from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("SEO product lookup failed: " + error.message);
  return data ? mapProduct(data) : null;
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

/* ---------- all indexable products (one scan per request) ---------- */

type Row = { product: SeoProduct; owner: string | null };

const loadIndexableRows = cache(async function (): Promise<Row[]> {
  const out: Row[] = [];
  const PAGE = 1000;
  for (let from = 0; from < 50000; from += PAGE) {
    const { data, error } = await db()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error("SEO products query failed: " + error.message);
    if (!data || data.length === 0) break;
    data.forEach(function (row: Record<string, any>) {
      const product = mapProduct(row);
      if (product && productIsIndexable(product)) out.push({ product: product, owner: clean(row.owner) });
    });
    if (data.length < PAGE) break;
  }
  return out;
});

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

function topKeys(counts: Map<string, number>, n: number): string[] {
  return Array.from(counts.entries())
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, n)
    .map(function (e) { return e[0]; });
}

function buildCategorySummaries(rows: Row[]): CategorySummary[] {
  const groups = new Map<string, Row[]>();
  rows.forEach(function (r) {
    const s = r.product.categorySlug;
    if (!s) return;
    const g = groups.get(s);
    if (g) g.push(r);
    else groups.set(s, [r]);
  });

  const out: CategorySummary[] = [];
  groups.forEach(function (g, slug) {
    const suppliers = new Set<string>();
    const places = new Map<string, number>();
    g.forEach(function (r) {
      if (r.product.supplierKey && r.product.seller) suppliers.add(r.product.supplierKey);
      if (r.product.place) bump(places, r.product.place);
    });
    out.push({
      slug: slug,
      name: pickCategoryLabel(slug, g.map(function (r) { return r.product.category || ""; })),
      count: g.length,
      supplierCount: suppliers.size,
      topPlaces: topKeys(places, 3),
    });
  });
  out.sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });
  return out;
}

type SupplierGroup = { summary: SupplierSummary; owner: string; products: SeoProduct[] };

function buildSupplierGroups(rows: Row[]): SupplierGroup[] {
  const groups = new Map<string, Row[]>();
  rows.forEach(function (r) {
    const key = r.product.supplierKey;
    if (!key || !r.owner || !r.product.seller) return;
    const g = groups.get(key);
    if (g) g.push(r);
    else groups.set(key, [r]);
  });

  const out: SupplierGroup[] = [];
  groups.forEach(function (g, key) {
    const names = new Map<string, number>();
    const places = new Map<string, number>();
    const cats = new Map<string, string[]>();
    let verified = false;
    g.forEach(function (r) {
      bump(names, r.product.seller as string);
      if (r.product.place) bump(places, r.product.place);
      if (r.product.isVerified) verified = true;
      const cs = r.product.categorySlug;
      if (cs) {
        const arr = cats.get(cs);
        if (arr) arr.push(r.product.category || "");
        else cats.set(cs, [r.product.category || ""]);
      }
    });
    const name = topKeys(names, 1)[0];
    const categories: { slug: string; name: string }[] = [];
    cats.forEach(function (raws, slug) {
      categories.push({ slug: slug, name: pickCategoryLabel(slug, raws) });
    });
    out.push({
      summary: {
        key: key,
        slug: supplierSlug(name, key),
        name: name,
        place: topKeys(places, 1)[0] || null,
        isVerified: verified,
        productCount: g.length,
        categories: categories,
      },
      owner: g[0].owner as string,
      products: g.map(function (r) { return r.product; }),
    });
  });
  out.sort(function (a, b) {
    return b.summary.productCount - a.summary.productCount || a.summary.name.localeCompare(b.summary.name);
  });
  return out;
}

/* ---------- public API for pages ---------- */

export async function getCategorySummaries(): Promise<CategorySummary[]> {
  return buildCategorySummaries(await loadIndexableRows());
}

export async function getCategoryPageData(slug: string) {
  const rows = await loadIndexableRows();
  const summaries = buildCategorySummaries(rows);
  const summary = summaries.find(function (s) { return s.slug === slug; });
  if (!summary) return null;
  const inCategory = rows.filter(function (r) { return r.product.categorySlug === slug; });
  return {
    summary: summary,
    products: inCategory.map(function (r) { return r.product; }),
    suppliers: buildSupplierGroups(inCategory).map(function (g) { return g.summary; }).slice(0, 12),
    otherCategories: summaries
      .filter(function (s) { return s.slug !== slug && s.count >= MIN_CATEGORY_PRODUCTS_TO_INDEX; })
      .slice(0, 12),
  };
}

export type PublicProfile = {
  description: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  verificationLevel: string | null;
  yearEstablished: string | null;
  exportCapable: string | null;
  mainProducts: string | null;
};

// Safe columns only: no phone, email, RC number, bank or admin fields are ever selected.
async function getPublicProfile(ownerEmail: string): Promise<PublicProfile | null> {
  try {
    const { data, error } = await db()
      .from("profiles")
      .select("about_business, city, state, country, verification_level, year_established, main_products, export_capable")
      .eq("email", ownerEmail)
      .maybeSingle();
    if (error || !data) return null;
    const d = data as Record<string, any>;
    const text = function (v: unknown): string | null {
      return v === null || v === undefined || v === "" ? null : String(v).trim() || null;
    };
    return {
      description: redactContacts(text(d.about_business)),
      city: text(d.city),
      state: text(d.state),
      country: text(d.country),
      verificationLevel: text(d.verification_level),
      yearEstablished: text(d.year_established),
      exportCapable: text(d.export_capable),
      mainProducts: redactContacts(text(d.main_products)),
    };
  } catch {
    return null;
  }
}

export async function getSupplierSummaries(): Promise<SupplierSummary[]> {
  return buildSupplierGroups(await loadIndexableRows()).map(function (g) { return g.summary; });
}

export async function getSupplierPageData(slug: string) {
  const key = idPrefixFromSlug(slug);
  if (!key) return null;
  const rows = await loadIndexableRows();
  const group = buildSupplierGroups(rows).find(function (g) { return g.summary.key === key; });
  if (!group) return null;
  const profile = await getPublicProfile(group.owner);
  return { summary: group.summary, products: group.products, profile: profile };
}

export async function getProductsPage(page: number, pageSize: number) {
  const rows = await loadIndexableRows();
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    products: rows.slice(start, start + pageSize).map(function (r) { return r.product; }),
    total: total,
    totalPages: totalPages,
    categories: buildCategorySummaries(rows).filter(function (c) { return c.count >= MIN_CATEGORY_PRODUCTS_TO_INDEX; }),
  };
}

export async function getHomeSeoData() {
  const rows = await loadIndexableRows();
  return {
    total: rows.length,
    categories: buildCategorySummaries(rows)
      .filter(function (c) { return c.count >= MIN_CATEGORY_PRODUCTS_TO_INDEX; })
      .slice(0, 8),
    suppliers: buildSupplierGroups(rows).map(function (g) { return g.summary; }).slice(0, 8),
    latest: rows.slice(0, 12).map(function (r) { return r.product; }),
  };
}

export async function getSitemapData() {
  const rows = await loadIndexableRows();
  return {
    products: rows.map(function (r) { return r.product; }),
    categories: buildCategorySummaries(rows),
    suppliers: buildSupplierGroups(rows).map(function (g) { return g.summary; }),
  };
}