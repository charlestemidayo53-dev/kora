import { absoluteUrl } from "@/lib/seo/metadata";
import { productPath, type SeoProduct } from "@/lib/seo/product";

const AVAILABILITY = {
  available: "https://schema.org/InStock",
  limited: "https://schema.org/LimitedAvailability",
  unavailable: "https://schema.org/OutOfStock",
} as const;

// Only real database values go in. No price, rating, review, brand or stock is invented.
export default function ProductJsonLd({ product }: { product: SeoProduct }) {
  const url = absoluteUrl(productPath(product));
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url,
  };
  if (product.description) data.description = product.description;
  if (product.images.length) data.image = product.images;
  if (product.category) data.category = product.category;
  if (product.brand) data.brand = { "@type": "Brand", name: product.brand };

  if (product.price !== null && !product.isEstimatedPrice) {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "NGN",
    };
    if (product.availability) offer.availability = AVAILABILITY[product.availability];
    if (product.seller) offer.seller = { "@type": "Organization", name: product.seller };
    data.offers = offer;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}