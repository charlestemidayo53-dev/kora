import type { MetadataRoute } from "next";
import { SITE_URL, MIN_CATEGORY_PRODUCTS_TO_INDEX } from "@/lib/seo/config";
import { getSitemapData } from "@/lib/seo/data";
import { productPath } from "@/lib/seo/product";
import { categoryPath } from "@/lib/seo/category";
import { BLOG_POSTS } from "@/lib/seo/blog";

export const revalidate = 3600;

const PUBLIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/products", priority: 0.9 },
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
    const data = await getSitemapData();
    data.products.forEach(function (p) {
      entries.push({
        url: SITE_URL + productPath(p),
        lastModified: p.createdAt ? new Date(p.createdAt) : undefined,
        priority: 0.6,
      });
    });
    data.categories.forEach(function (c) {
      if (c.count >= MIN_CATEGORY_PRODUCTS_TO_INDEX) {
        entries.push({ url: SITE_URL + categoryPath(c.slug), priority: 0.8 });
      }
    });
    data.suppliers.forEach(function (s) {
      entries.push({ url: SITE_URL + "/suppliers/" + s.slug, priority: 0.6 });
    });
  } catch (err) {
    console.error("Sitemap: database query failed, serving static routes only.", err);
  }

  BLOG_POSTS.forEach(function (post) {
    entries.push({
      url: SITE_URL + "/blog/" + post.slug,
      lastModified: new Date(post.dateModified || post.datePublished),
      priority: 0.6,
    });
  });
  if (BLOG_POSTS.length > 0) entries.push({ url: SITE_URL + "/blog", priority: 0.5 });

  return entries;
}