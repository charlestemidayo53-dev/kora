import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Marketplace",
  description:
    "Browse bulk agricultural and industrial products from African suppliers, manufacturers and producers on Kora.",
  path: "/marketplace",
});

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}