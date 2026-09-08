import { supabase } from "@/lib/supabase";
import { normalizeName, baseName } from "./normalize";
import mockData from "./mock-data.json";

interface DiscoveryItem {
  name: string;
  category: string;
  price: number;
  unit?: string;
  source_name: string;
}

export async function importCatalogueFromMock() {
  const { data: existing, error: fetchError } = await supabase
    .from("catalogue_products")
    .select("id, name");

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const existingBaseNames = new Map(
    (existing ?? []).map((row) => [baseName(row.name), row.id])
  );

  const created: string[] = [];
  const skipped: string[] = [];

  for (const item of mockData as DiscoveryItem[]) {
    const target = baseName(item.name);

    if (existingBaseNames.has(target)) {
      skipped.push(item.name);
      continue;
    }

    const { error: insertError } = await supabase.from("catalogue_products").insert({
      name: item.name,
      normalized_name: normalizeName(item.name),
      category: item.category,
      unit: item.unit ?? null,
      estimated_market_price: item.price,
      source: "discovery",
    });

    if (insertError) {
      skipped.push(`${item.name} (error: ${insertError.message})`);
      continue;
    }

    existingBaseNames.set(target, "pending");
    created.push(item.name);
  }

  return { success: true, created, skipped };
}
