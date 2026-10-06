import type { MetadataRoute } from "next";
import { SITE_URL, PRIVATE_PATHS, BLOCKED_QUERY_PARAMS } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const queryBlocks: string[] = [];
  BLOCKED_QUERY_PARAMS.forEach(function (p) {
    queryBlocks.push("/*?" + p + "=");
    queryBlocks.push("/*&" + p + "=");
  });

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS, ...queryBlocks],
      },
    ],
    sitemap: SITE_URL + "/sitemap.xml",
  };
}