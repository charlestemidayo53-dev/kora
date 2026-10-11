import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "About Us",
  description:
    "Learn about Kora Marketplace, an African B2B marketplace helping buyers and suppliers discover products, connect and explore bulk trade across Africa and internationally.",
  path: "/about",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}