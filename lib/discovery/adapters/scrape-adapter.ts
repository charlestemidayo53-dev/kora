// lib/discovery/adapters/scrape-adapter.ts
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import type { Availability, NormalizedProduct, ScrapeSourceConfig } from "../types";

function normalizeAvailability(raw: string | undefined): Availability {
  if (!raw) return "available";
  const s = raw.trim().toLowerCase();
  if (["out of stock", "unavailable", "sold out"].includes(s)) return "unavailable";
  if (["limited", "low stock", "few left"].includes(s)) return "limited";
  return "available";
}

export async function fetchFromScrape(config: ScrapeSourceConfig): Promise<NormalizedProduct[]> {
  const res = await fetch(config.listUrl, {
    headers: { "User-Agent": "KoraMarketplaceBot/1.0 (+https://korafrica.com/discovery-bot)" },
  });
  if (!res.ok) throw new Error(`Scrape source fetch failed: ${res.status} ${res.statusText}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const { fieldSelectors } = config;
  const results: NormalizedProduct[] = [];
  const baseUrl = new URL(config.listUrl);

  $(config.itemSelector).each((_, el) => {
    const $el = $(el);
    const name = fieldSelectors.name ? $el.find(fieldSelectors.name).first().text().trim() : "";
    if (!name) return;

    const externalIdText = fieldSelectors.externalId
      ? $el.find(fieldSelectors.externalId).first().text().trim()
      : "";
    const externalId =
      externalIdText || createHash("sha1").update(`${config.listUrl}:${name}`).digest("hex");

    const imageSrc = fieldSelectors.images ? $el.find(fieldSelectors.images).first().attr("src") : undefined;

    let sourceUrl: string | null = null;
    if (fieldSelectors.sourceUrlAttr) {
      const href = $el.attr(fieldSelectors.sourceUrlAttr) || $el.find("a").first().attr("href");
      if (href) sourceUrl = new URL(href, baseUrl).toString();
    }

    results.push({
      externalId,
      name,
      description: fieldSelectors.description
        ? $el.find(fieldSelectors.description).first().text().trim() || null
        : null,
      category: fieldSelectors.category
        ? $el.find(fieldSelectors.category).first().text().trim() || null
        : null,
      price: fieldSelectors.price
        ? Number($el.find(fieldSelectors.price).first().text().replace(/[^\d.]/g, "")) || null
        : null,
      unit: fieldSelectors.unit ? $el.find(fieldSelectors.unit).first().text().trim() || null : null,
      quantityAvailable: null,
      location: fieldSelectors.location
        ? $el.find(fieldSelectors.location).first().text().trim() || null
        : null,
      images: imageSrc ? [imageSrc] : [],
      supplierName: fieldSelectors.supplierName
        ? $el.find(fieldSelectors.supplierName).first().text().trim() || null
        : null,
      supplierPhone: fieldSelectors.supplierPhone
        ? $el.find(fieldSelectors.supplierPhone).first().text().trim() || null
        : null,
      supplierEmail: fieldSelectors.supplierEmail
        ? $el.find(fieldSelectors.supplierEmail).first().text().trim() || null
        : null,
      sourceUrl,
      availability: normalizeAvailability(
        fieldSelectors.availability ? $el.find(fieldSelectors.availability).first().text() : undefined
      ),
    });
  });

  return results;
}
