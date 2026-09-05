// lib/discovery/types.ts
// Shared types for the Product Discovery / Import system.

export type SourceType = "api" | "csv" | "scrape";
export type Availability = "available" | "limited" | "unavailable";

export interface DiscoverySource {
  id: string;
  name: string;
  source_type: SourceType;
  config: ApiSourceConfig | CsvSourceConfig | ScrapeSourceConfig;
  enabled: boolean;
  schedule_cron: string;
}

// Every field map below is optional except externalId/name — don't assume
// a source provides everything. Missing fields just come through as null.
interface CommonFieldMap {
  externalId: string;
  name: string;
  description?: string;
  category?: string;
  price?: string;
  unit?: string;
  quantityAvailable?: string;
  location?: string;
  images?: string;
  supplierName?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  sourceUrl?: string;   // link back to the original product/listing
  availability?: string; // raw field the source uses for stock status
}

export interface ApiSourceConfig {
  endpoint: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  authEnvKey?: string; // env var name holding the bearer token — never store the token itself in the DB
  fieldMap: CommonFieldMap;
  resultsPath?: string; // dot-path to the array of items, if nested in the response
}

export interface CsvSourceConfig {
  storageBucket: string;
  storagePath: string;
  columnMap: CommonFieldMap;
}

export interface ScrapeSourceConfig {
  // Only for sources you've confirmed permit automated access.
  listUrl: string;
  itemSelector: string;
  fieldSelectors: Omit<CommonFieldMap, "externalId" | "quantityAvailable"> & {
    externalId?: string;
    sourceUrlAttr?: string; // attribute (e.g. "href") holding the detail link, relative to itemSelector
  };
}

export interface NormalizedProduct {
  externalId: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  unit: string | null;
  quantityAvailable: number | null;
  location: string | null;
  images: string[];
  supplierName: string | null;
  supplierPhone: string | null;
  supplierEmail: string | null;
  sourceUrl: string | null;
  availability: Availability;
  raw?: unknown;
}

export interface DiscoveryRunResult {
  itemsFound: number;
  itemsNew: number;
  itemsUpdated: number;
  itemsDuplicate: number;
  itemsMarkedUnavailable: number;
  errors: string[];
}