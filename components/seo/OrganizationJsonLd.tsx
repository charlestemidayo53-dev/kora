import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/seo/config";

export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_URL + "/logo-icon.png",
    description: DEFAULT_DESCRIPTION,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}