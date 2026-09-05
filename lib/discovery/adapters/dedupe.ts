// lib/discovery/dedupe.ts
import { createHash } from "crypto";
import type { NormalizedProduct } from "./types";

export function computeContentHash(p: NormalizedProduct): string {
  const basis = JSON.stringify({
    name: p.name?.trim().toLowerCase(),
    description: p.description?.trim().toLowerCase(),
    price: p.price,
    unit: p.unit,
    quantityAvailable: p.quantityAvailable,
    location: p.location?.trim().toLowerCase(),
    images: p.images,
    availability: p.availability,
  });
  return createHash("sha256").update(basis).digest("hex");
}