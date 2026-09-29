import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://korafrica.com";

  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/categories",
    "/marketplace",
    "/discover",
    "/suppliers",
    "/manufacturers",
    "/rfq",
    "/post-rfq",
    "/help",
    "/support",
    "/terms",
    "/privacy",
    "/cookies",
    "/refund-policy",
    "/auth/login",
    "/auth/register",
  ];

  return staticRoutes.map(function (route) {
    return {
      url: baseUrl + route,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    };
  });
}
