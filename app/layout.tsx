import "./globals.css";
import type { Metadata, Viewport } from "next";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Kora Marketplace | African B2B Trading Platform",
  description:
    "Buy and sell products in bulk across Africa. Verified suppliers, secure escrow, real-time trade connecting buyers and businesses continent-wide.",
  icons: {
    icon: "/logo-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8faf8] text-gray-900 antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}