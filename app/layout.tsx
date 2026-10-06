import "./globals.css";
import type { Metadata, Viewport } from "next";
import SiteShell from "@/components/SiteShell";
import InAppBrowserBanner from "@/components/InAppBrowserBanner";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SEO_KEYWORDS,
} from "@/lib/seo/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s | " + SITE_NAME },
  description: DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  // "./" = each page's own path (query strings dropped), resolved against metadataBase
  alternates: { canonical: "./" },
  robots: { index: true, follow: true },
  icons: {
    icon: "/logo-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
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
        <OrganizationJsonLd />
        <SiteShell>{children}</SiteShell>
        <InAppBrowserBanner />
      </body>
    </html>
  );
}