import { INDEX_DISCOVERED_LISTINGS } from "./config";
import { slugify, shortId } from "./slug";

export type SeoProduct = {
  id: string;
  name: string;
  description: string | null;
  images: string[]; // absolute URLs
  category: string | null;
  subcategory: string | null;
  place: string | null; // state, else city, else location
  price: number | null;
  unit: string | null;
  moq: string | null;
  seller: string | null; // public business name only, never an email
  isVerified: boolean;
  brand: string | null;
  createdAt: string | null;
  listingSource: string | null;
  isEstimatedPrice: boolean;
  availability: "available" | "limited" | "unavailable" | null;
};

type SlugInput = Pick<SeoProduct, "id" | "name" | "place">;

export function truncate(text: string, max: number): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "\u2026" : t;
}

export function productSlug(p: SlugInput): string {
  const base = slugify((p.name || "product") + " " + (p.place || ""));
  return (base || "product") + "-" + shortId(p.id);
}

export function productPath(p: SlugInput): string {
  return "/products/" + productSlug(p);
}

export function productIsIndexable(p: SeoProduct): boolean {
  if (!p.name.trim()) return false;
  if (p.listingSource === "discovered" && !INDEX_DISCOVERED_LISTINGS) return false;
  return true;
}

export function productMetaTitle(p: SeoProduct): string {
  const name = truncate(p.name, 34);
  const prefix = /^bulk\b/i.test(name) ? "" : "Bulk ";
  const where = p.place ? truncate(p.place, 22) : "Africa";
  return prefix + name + " Supplier in " + where;
}

export function productMetaDescription(p: SeoProduct): string {
  const where = p.place || "Africa";
  const verified = p.isVerified ? "verified " : "";
  const moq = p.moq ? " Minimum order: " + p.moq + (p.unit ? " " + p.unit : "") + "." : "";
  return truncate(
    "Source " + p.name + " in bulk from a " + verified + "supplier in " + where + " on Kora." + moq +
      " Connect directly with the supplier to discuss quantities, pricing and trade requirements.",
    158,
  );
}