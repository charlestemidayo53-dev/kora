import { createHash } from "crypto";
import { slugify } from "./slug";

export type SupplierSummary = {
  key: string;
  slug: string;
  name: string;
  place: string | null;
  isVerified: boolean;
  productCount: number;
  categories: { slug: string; name: string }[];
};

// Stable public id for a supplier. A one-way hash, so the owner email never appears in a URL.
export function supplierKeyFromOwner(owner: string | null | undefined): string | null {
  const o = (owner || "").trim().toLowerCase();
  if (!o) return null;
  return createHash("sha1").update(o).digest("hex").slice(0, 8);
}

export function supplierSlug(name: string, key: string): string {
  return (slugify(name, 50) || "supplier") + "-" + key;
}

export function supplierPath(name: string, key: string): string {
  return "/suppliers/" + supplierSlug(name, key);
}