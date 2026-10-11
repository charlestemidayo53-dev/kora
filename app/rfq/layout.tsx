import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Request for Quotation (RFQ)",
  description:
    "Post or browse requests for quotation on Kora Marketplace and connect with suppliers for bulk orders.",
  path: "/rfq",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}