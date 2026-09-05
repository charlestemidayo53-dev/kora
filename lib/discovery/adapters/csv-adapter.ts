// lib/discovery/adapters/csv-adapter.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import type { Availability, CsvSourceConfig, NormalizedProduct } from "../types";

function normalizeAvailability(raw: unknown): Availability {
  if (raw == null || raw === "") return "available";
  const s = String(raw).trim().toLowerCase();
  if (["out_of_stock", "out of stock", "unavailable", "sold_out", "sold out", "no", "false", "0"].includes(s)) {
    return "unavailable";
  }
  if (["limited", "low_stock", "low stock", "few_left"].includes(s)) return "limited";
  return "available";
}

export async function fetchFromCsv(
  supabase: SupabaseClient,
  config: CsvSourceConfig
): Promise<NormalizedProduct[]> {
  const { data, error } = await supabase.storage.from(config.storageBucket).download(config.storagePath);
  if (error || !data) throw new Error(`Could not download CSV source: ${error?.message ?? "unknown error"}`);

  const text = await data.text();
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) throw new Error(`CSV parse error: ${parsed.errors[0].message}`);

  const { columnMap } = config;

  return parsed.data.map((row): NormalizedProduct => {
    const imagesRaw = columnMap.images ? row[columnMap.images] : "";
    return {
      externalId: row[columnMap.externalId]?.trim(),
      name: row[columnMap.name]?.trim() ?? "Untitled product",
      description: columnMap.description ? row[columnMap.description] ?? null : null,
      category: columnMap.category ? row[columnMap.category] ?? null : null,
      price: columnMap.price ? Number(row[columnMap.price]) || null : null,
      unit: columnMap.unit ? row[columnMap.unit] ?? null : null,
      quantityAvailable: columnMap.quantityAvailable ? Number(row[columnMap.quantityAvailable]) || null : null,
      location: columnMap.location ? row[columnMap.location] ?? null : null,
      images: imagesRaw ? imagesRaw.split(",").map((s) => s.trim()).filter(Boolean) : [],
      supplierName: columnMap.supplierName ? row[columnMap.supplierName] ?? null : null,
      supplierPhone: columnMap.supplierPhone ? row[columnMap.supplierPhone] ?? null : null,
      supplierEmail: columnMap.supplierEmail ? row[columnMap.supplierEmail] ?? null : null,
      sourceUrl: columnMap.sourceUrl ? row[columnMap.sourceUrl] ?? null : null,
      availability: normalizeAvailability(columnMap.availability ? row[columnMap.availability] : null),
      raw: row,
    };
  });
}
