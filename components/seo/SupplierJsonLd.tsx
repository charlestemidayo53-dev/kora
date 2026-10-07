type Props = {
  name: string;
  url: string;
  description?: string | null;
  region?: string | null;
  country?: string | null;
};

export default function SupplierJsonLd({ name, url, description, region, country }: Props) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: name,
    url: url,
  };
  if (description) data.description = description;
  const address: Record<string, unknown> = {};
  if (region) address.addressRegion = region;
  if (country) address.addressCountry = country;
  if (Object.keys(address).length) data.address = { "@type": "PostalAddress", ...address };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}