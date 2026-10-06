export function slugify(input: string | null | undefined, max = 60): string {
  const base = (input || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, max).replace(/-+$/g, "");
}

export function shortId(id: string): string {
  return String(id || "").slice(0, 8).toLowerCase();
}

export function idPrefixFromSlug(slug: string): string | null {
  let value = slug;
  try {
    value = decodeURIComponent(slug);
  } catch {
    return null;
  }
  const last = value.split("-").pop() || "";
  return /^[0-9a-f]{8}$/.test(last) ? last : null;
}

// A UUID starts with 8 hex chars, so every id with that prefix sits inside this range.
export function uuidRange(prefix: string): { min: string; max: string } {
  return {
    min: prefix + "-0000-0000-0000-000000000000",
    max: prefix + "-ffff-ffff-ffff-ffffffffffff",
  };
}