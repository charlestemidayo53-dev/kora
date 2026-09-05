// lib/discovery/adapters/api-adapter.ts
import type { ApiSourceConfig, Availability, NormalizedProduct } from "../types";

function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function normalizeAvailability(raw: unknown): Availability {
  if (raw == null) return "available";
  const s = String(raw).trim().toLowerCase();
  if (["out_of_stock", "out of stock", "unavailable", "sold_out", "sold out", "false", "0"].includes(s)) {
    return "unavailable";
  }
  if (["limited", "low_stock", "low stock", "few_left"].includes(s)) {
    return "limited";
  }
  return "available";
}

export async function fetchFromApi(config: ApiSourceConfig): Promise<NormalizedProduct[]> {
  const headers: Record<string, string> = { ...(config.headers ?? {}) };
  if (config.authEnvKey) {
    const token = process.env[config.authEnvKey];
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(config.endpoint, { method: config.method ?? "GET", headers });
  if (!res.ok) throw new Error(`API source fetch failed: ${res.status} ${res.statusText}`);

  const body = await res.json();
  const items: any[] = config.resultsPath ? getByPath(body, config.resultsPath) ?? [] : body;
  if (!Array.isArray(items)) {
    throw new Error("API source did not return an array at the configured resultsPath");
  }

  const { fieldMap } = config;

  return items.map((item): NormalizedProduct => {
    const images = fieldMap.images ? getByPath(item, fieldMap.images) : [];
    return {
      externalId: String(getByPath(item, fieldMap.externalId)),
      name: getByPath(item, fieldMap.name) ?? "Untitled product",
      description: fieldMap.description ? getByPath(item, fieldMap.description) ?? null : null,
      category: fieldMap.category ? getByPath(item, fieldMap.category) ?? null : null,
      price: fieldMap.price ? Number(getByPath(item, fieldMap.price)) || null : null,
      unit: fieldMap.unit ? getByPath(item, fieldMap.unit) ?? null : null,
      quantityAvailable: fieldMap.quantityAvailable
        ? Number(getByPath(item, fieldMap.quantityAvailable)) || null
        : null,
      location: fieldMap.location ? getByPath(item, fieldMap.location) ?? null : null,
      images: Array.isArray(images) ? images : images ? [images] : [],
      supplierName: fieldMap.supplierName ? getByPath(item, fieldMap.supplierName) ?? null : null,
      supplierPhone: fieldMap.supplierPhone ? getByPath(item, fieldMap.supplierPhone) ?? null : null,
      supplierEmail: fieldMap.supplierEmail ? getByPath(item, fieldMap.supplierEmail) ?? null : null,
      sourceUrl: fieldMap.sourceUrl ? getByPath(item, fieldMap.sourceUrl) ?? null : null,
      availability: normalizeAvailability(
        fieldMap.availability ? getByPath(item, fieldMap.availability) : null
      ),
      raw: item,
    };
  });
}
