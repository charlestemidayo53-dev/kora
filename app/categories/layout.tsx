import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Product Categories",
  description:
    "Explore product categories on Kora: agriculture and food, construction, industrial equipment, electrical, raw materials and more from African suppliers.",
  path: "/categories",
});

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}