export function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

const QUALIFIER_WORDS = [
  "white", "yellow", "fresh", "dried", "raw", "whole",
  "ground", "powder", "grade a", "grade b", "premium", "local", "organic",
];

// Strips common qualifiers so "Gari" and "Gari White" reduce to the same base
export function baseName(name: string): string {
  let n = normalizeName(name);
  for (const q of QUALIFIER_WORDS) {
    n = n.replace(new RegExp(`\\b${q}\\b`, "g"), "").trim();
  }
  n = n.replace(/\(|\)/g, "").replace(/\s+/g, " ").trim();
  return n;
}
