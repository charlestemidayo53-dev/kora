import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/config";
import { getIndexableProductsForSitemap } from "@/lib/seo/data";
import { productPath } from "@/lib/seo/product";

export const revalidate = 3600;

const PUBLIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/marketplace", priority: 0.9 },
  { path: "/categories", priority: 0.9 },
  { path: "/suppliers", priority: 0.8 },
  { path: "/manufacturers", priority: 0.8 },
  { path: "/discover", priority: 0.7 },
  { path: "/rfq", priority: 0.7 },
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.5 },
  { path: "/help", priority: 0.4 },
  { path: "/support", priority: 0.4 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
  { path: "/cookies", priority: 0.3 },
  { path: "/refund-policy", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map(function (r) {
    return { url: SITE_URL + r.path, priority: r.priority };
  });

  try {
    const products = await getIndexableProductsForSitemap();
    products.forEach(function (p) {
      entries.push({
        url: SITE_URL + productPath(p),
        lastModified: p.createdAt ? new Date(p.createdAt) : undefined,
        priority: 0.6,
      });
    });
  } catch (err) {
    console.error("Sitemap: product query failed, serving static routes only.", err);
  }

  return entries;
}