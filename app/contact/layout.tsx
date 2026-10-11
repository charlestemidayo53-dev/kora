import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the Kora Marketplace team for support, supplier onboarding and business enquiries.",
  path: "/contact",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}