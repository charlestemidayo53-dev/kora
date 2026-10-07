import { CATEGORY_ALIASES } from "./config";
import { categorySlugFrom, titleCaseSlug } from "./slug";
import { joinList, plural } from "./product";

export type CategorySummary = {
  slug: string;
  name: string;
  count: number;
  supplierCount: number;
  topPlaces: string[];
};

export function normalizeCategorySlug(raw: string | null | undefined): string | null {
  const s = categorySlugFrom(raw);
  if (!s) return null;
  return CATEGORY_ALIASES[s] || s;
}

export function categoryPath(slug: string): string {
  return "/categories/" + slug;
}

// Prefer a properly written raw value ("Agriculture & Food") over a lowercase slug-style one.
export function pickCategoryLabel(slug: string, rawValues: string[]): string {
  const counts = new Map<string, number>();
  rawValues.forEach(function (v) {
    const t = (v || "").trim();
    if (t && /[A-Z]/.test(t)) counts.set(t, (counts.get(t) || 0) + 1);
  });
  let best = "";
  let bestN = 0;
  counts.forEach(function (n, v) {
    if (n > bestN) {
      best = v;
      bestN = n;
    }
  });
  return best || titleCaseSlug(slug);
}

// Built only from real counts and real locations in the database.
export function categoryIntro(s: CategorySummary): string {
  let text = "Kora lists " + plural(s.count, "product") + " in " + s.name;
  if (s.supplierCount > 0) text += " from " + plural(s.supplierCount, "supplier");
  if (s.topPlaces.length) text += ", with listings in " + joinList(s.topPlaces);
  return text + ". Contact suppliers directly to discuss quantities, pricing and trade requirements.";
}