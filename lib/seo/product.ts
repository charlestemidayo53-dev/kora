import { INDEX_DISCOVERED_LISTINGS } from "./config";
import { slugify, shortId } from "./slug";

export type SeoProduct = {
  id: string;
  name: string;
  description: string | null;
  images: string[]; // absolute URLs
  category: string | null;
  categorySlug: string | null;
  subcategory: string | null;
  place: string | null; // state, else city, else location
  price: number | null;
  unit: string | null;
  moq: string | null;
  seller: string | null; // public business name only, never an email
  supplierKey: string | null; // hash of the owner, never the email itself
  isVerified: boolean;
  brand: string | null;
  createdAt: string | null;
  listingSource: string | null;
  isEstimatedPrice: boolean;
  availability: "available" | "limited" | "unavailable" | null;
};

type SlugInput = Pick<SeoProduct, "id" | "name" | "place">;

export function cleanName(text: string): string {
  return (text || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/^[\s,.;:-]+/, "")
    .replace(/[\s,.;:-]+$/, "")
    .trim();
}

export function truncate(text: string, max: number, ellipsis = true): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:-]+$/, "");
  return ellipsis ? base + "\u2026" : base;
}

export function plural(n: number, word: string): string {
  return n + " " + word + (n === 1 ? "" : "s");
}

export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

export function formatPrice(p: SeoProduct): string | null {
  if (p.price === null || p.isEstimatedPrice) return null;
  const whole = Math.round(p.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "\u20A6" + whole + (p.unit ? " / " + p.unit : "");
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
  const name = truncate(p.name, 34, false);
  const prefix = /^bulk\b/i.test(name) ? "" : "Bulk ";
  const where = p.place ? truncate(p.place, 22, false) : "Africa";
  return prefix + name + " Supplier in " + where;
}

export function productMetaDescription(p: SeoProduct): string {
  const where = p.place || "Africa";
  const verified = p.isVerified ? "verified " : "";
  const base = "Source " + p.name + " in bulk from a " + verified + "supplier in " + where + " on Kora.";
  const moq = p.moq ? " Minimum order: " + p.moq + (p.unit ? " " + p.unit : "") + "." : "";
  const tail = " Connect directly with the supplier to discuss quantities, pricing and trade requirements.";
  if ((base + moq + tail).length <= 158) return base + moq + tail;
  if ((base + tail).length <= 158) return base + tail;
  return truncate(base + tail, 158);
}