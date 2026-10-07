import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import HomeSeoSection from "@/components/seo/HomeSeoSection";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ path: "/" });
export const revalidate = 3600;

export default function Page() {
  return (
    <>
      <HomeClient />
      <HomeSeoSection />
    </>
  );
}