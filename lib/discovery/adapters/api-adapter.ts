// lib/discovery/adapters/api-adapter.ts
import type { ApiSourceConfig, Availability, NormalizedProduct } from "../types";

function readPath(value: unknown, path: string): unknown {
  if (!path) return undefined;

  return path.split(".").reduce(function (current: unknown, key: string) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current) && /^\d+$/.test(key)) return current[Number(key)];
    if (typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
}

function asString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const numeric = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function asImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(asString)
      .filter(function (item): item is string { return Boolean(item); });
  }

  const text = asString(value);
  if (!text) return [];

  return text
    .split(",")
    .map(function (item) { return item.trim(); })
    .filter(Boolean);
}

function asAvailability(value: unknown): Availability {
  const normalized = String(value || "available").trim().toLowerCase();
  if (normalized === "limited") return "limited";
  if (normalized === "unavailable" || normalized === "out_of_stock" || normalized === "out of stock") {
    return "unavailable";
  }
  return "available";
}

function getItems(payload: unknown, resultsPath?: string): unknown[] {
  const result = resultsPath ? readPath(payload, resultsPath) : payload;
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object") return [result];
  return [];
}

export async function fetchFromApi(config: ApiSourceConfig): Promise<NormalizedProduct[]> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(config.headers || {}),
  };

  if (config.authEnvKey) {
    const token = process.env[config.authEnvKey];
    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(config.endpoint, {
    method: config.method || "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status} ${response.statusText}`);
  }

  const payload: unknown = await response.json();
  const items = getItems(payload, config.resultsPath);

  return items.flatMap(function (raw): NormalizedProduct[] {
    if (!raw || typeof raw !== "object") return [];

    const source = raw as Record<string, unknown>;
    const fieldMap = config.fieldMap;
    const externalId = asString(readPath(source, fieldMap.externalId));
    const name = asString(readPath(source, fieldMap.name));

    if (!externalId || !name) return [];

    return [{
      externalId,
      name,
      description: asString(readPath(source, fieldMap.description || "")),
      category: asString(readPath(source, fieldMap.category || "")),
      price: asNumber(readPath(source, fieldMap.price || "")),
      unit: asString(readPath(source, fieldMap.unit || "")),
      quantityAvailable: asNumber(readPath(source, fieldMap.quantityAvailable || "")),
      location: asString(readPath(source, fieldMap.location || "")),
      images: asImages(readPath(source, fieldMap.images || "")),
      supplierName: asString(readPath(source, fieldMap.supplierName || "")),
      supplierPhone: asString(readPath(source, fieldMap.supplierPhone || "")),
      supplierEmail: asString(readPath(source, fieldMap.supplierEmail || "")),
      sourceUrl: asString(readPath(source, fieldMap.sourceUrl || "")),
      availability: asAvailability(readPath(source, fieldMap.availability || "")),
      raw,
    }];
  });
}
