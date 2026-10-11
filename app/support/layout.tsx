import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Support",
  description:
    "Get help with your Kora Marketplace account, orders and product listings.",
  path: "/support",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}