import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "African Manufacturers and Producers",
  description:
    "Discover manufacturers and producers on Kora Marketplace and connect with them for bulk and wholesale orders.",
  path: "/manufacturers",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}