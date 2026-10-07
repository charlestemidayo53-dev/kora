import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Suppliers",
  description:
    "Find suppliers, producers and distributors on Kora and connect directly to source products in bulk across Africa.",
  path: "/suppliers",
});

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}