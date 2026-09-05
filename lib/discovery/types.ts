// lib/discovery/types.ts
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
  sourceUrl?: string;
  availability?: string;
}

export interface ApiSourceConfig {
  endpoint: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  authEnvKey?: string;
  fieldMap: CommonFieldMap;
  resultsPath?: string;
}

export interface CsvSourceConfig {
  storageBucket: string;
  storagePath: string;
  columnMap: CommonFieldMap;
}

export interface ScrapeSourceConfig {
  listUrl: string;
  itemSelector: string;
  fieldSelectors: Omit<CommonFieldMap, "externalId" | "quantityAvailable"> & {
    externalId?: string;
    sourceUrlAttr?: string;
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
