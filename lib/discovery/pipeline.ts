// lib/discovery/pipeline.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchFromApi } from "./adapters/api-adapter";
import { fetchFromCsv } from "./adapters/csv-adapter";
import { fetchFromScrape } from "./adapters/scrape-adapter";
import { computeContentHash } from "./dedupe";
import { ensureClaimInvite, matchSupplier } from "./supplier-matching";
import type {
  ApiSourceConfig,
  CsvSourceConfig,
  DiscoveryRunResult,
  DiscoverySource,
  ScrapeSourceConfig,
} from "./types";

export async function runDiscoverySource(
  supabase: SupabaseClient,
  source: DiscoverySource
): Promise<DiscoveryRunResult> {
  const result: DiscoveryRunResult = {
    itemsFound: 0,
    itemsNew: 0,
    itemsUpdated: 0,
    itemsDuplicate: 0,
    itemsMarkedUnavailable: 0,
    errors: [],
  };

  const { data: run } = await supabase
    .from("discovery_runs")
    .insert({ source_id: source.id, status: "running" })
    .select("id")
    .single();

  const seenExternalIds = new Set<string>();

  try {
    const items =
      source.source_type === "api"
        ? await fetchFromApi(source.config as ApiSourceConfig)
        : source.source_type === "csv"
        ? await fetchFromCsv(supabase, source.config as CsvSourceConfig)
        : await fetchFromScrape(source.config as ScrapeSourceConfig);

    result.itemsFound = items.length;

    for (const item of items) {
      if (!item.externalId || !item.name) continue;
      seenExternalIds.add(item.externalId);

      const contentHash = computeContentHash(item);

      const { data: existing } = await supabase
        .from("products")
        .select("id, content_hash")
        .eq("discovery_source_id", source.id)
        .eq("external_ref_id", item.externalId)
        .maybeSingle();

      if (existing) {
        if (existing.content_hash === contentHash) {
          result.itemsDuplicate += 1;
          continue;
        }

        await supabase
          .from("products")
          .update({
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            unit: item.unit,
            quantity: item.quantityAvailable != null ? String(item.quantityAvailable) : null,
            location: item.location,
            image: item.images[0] ?? null,
            source_url: item.sourceUrl,
            availability: item.availability,
            content_hash: contentHash,
            last_synced_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        result.itemsUpdated += 1;
      } else {
        const { ownerEmail, isClaimed } = await matchSupplier(supabase, item);

        const { data: inserted, error: insertError } = await supabase
          .from("products")
          .insert({
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            unit: item.unit,
            quantity: item.quantityAvailable != null ? String(item.quantityAvailable) : null,
            location: item.location,
            image: item.images[0] ?? null,
            seller: item.supplierName,
            owner: ownerEmail,
            listing_source: "discovered",
            discovery_source_id: source.id,
            external_ref_id: item.externalId,
            source_name: source.name,
            source_url: item.sourceUrl,
            availability: item.availability,
            external_supplier_name: item.supplierName,
            external_supplier_contact_phone: item.supplierPhone,
            external_supplier_contact_email: item.supplierEmail,
            is_claimed: isClaimed,
            content_hash: contentHash,
            discovered_at: new Date().toISOString(),
            last_synced_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertError) {
          result.errors.push(`Insert failed for ${item.externalId}: ${insertError.message}`);
          continue;
        }

        if (!isClaimed && inserted) {
          await ensureClaimInvite(supabase, inserted.id, item);
        }

        result.itemsNew += 1;
      }
    }

    const { data: previouslyImported } = await supabase
      .from("products")
      .select("id, external_ref_id, availability")
      .eq("discovery_source_id", source.id)
      .neq("availability", "unavailable");

    const idsToMarkUnavailable = (previouslyImported ?? [])
      .filter((p) => p.external_ref_id && !seenExternalIds.has(p.external_ref_id))
      .map((p) => p.id);

    if (idsToMarkUnavailable.length > 0) {
      await supabase
        .from("products")
        .update({ availability: "unavailable", last_synced_at: new Date().toISOString() })
        .in("id", idsToMarkUnavailable);
      result.itemsMarkedUnavailable = idsToMarkUnavailable.length;
    }

    await supabase
      .from("discovery_runs")
      .update({
        finished_at: new Date().toISOString(),
        status: result.errors.length ? "failed" : "success",
        items_found: result.itemsFound,
        items_new: result.itemsNew,
        items_updated: result.itemsUpdated,
        items_duplicate: result.itemsDuplicate,
        items_marked_unavailable: result.itemsMarkedUnavailable,
        error_message: result.errors.join("; ") || null,
      })
      .eq("id", run?.id);

    await supabase
      .from("discovery_sources")
      .update({
        last_run_at: new Date().toISOString(),
        last_run_status: result.errors.length ? "failed" : "success",
      })
      .eq("id", source.id);

    return result;
  } catch (err: any) {
    const message = err?.message ?? String(err);
    result.errors.push(message);

    await supabase
      .from("discovery_runs")
      .update({ finished_at: new Date().toISOString(), status: "failed", items_found: result.itemsFound, error_message: message })
      .eq("id", run?.id);

    await supabase
      .from("discovery_sources")
      .update({ last_run_at: new Date().toISOString(), last_run_status: "failed" })
      .eq("id", source.id);

    return result;
  }
}

export async function runAllDiscoverySources(supabase: SupabaseClient) {
  const { data: sources, error } = await supabase.from("discovery_sources").select("*").eq("enabled", true);
  if (error) throw new Error(`Could not load discovery sources: ${error.message}`);

  const results = [];
  for (const source of sources ?? []) {
    const result = await runDiscoverySource(supabase, source as DiscoverySource);
    results.push({ sourceId: source.id, sourceName: source.name, ...result });
  }
  return results;
}
