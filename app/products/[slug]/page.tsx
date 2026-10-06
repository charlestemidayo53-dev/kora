import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { getProductSeoBySlug, getRelatedProducts } from "@/lib/seo/data";
import {
  productPath,
  productSlug,
  productMetaTitle,
  productMetaDescription,
  productIsIndexable,
} from "@/lib/seo/product";
import { createMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductSeoBySlug(slug);
  if (!product) {
    return createMetadata({ title: "Product not found", path: "/products/" + slug, noIndex: true });
  }
  return createMetadata({
    title: productMetaTitle(product),
    description: productMetaDescription(product),
    path: productPath(product),
    image: product.images[0],
    noIndex: !productIsIndexable(product),
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductSeoBySlug(slug);
  if (!product) notFound();

  // One canonical URL per product (e.g. if the name or location was edited).
  if (slug !== productSlug(product)) permanentRedirect(productPath(product));

  const related = await getRelatedProducts(product);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: product.name, path: productPath(product) },
  ];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={crumbs} />

      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 text-[11px] sm:text-xs text-gray-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-[#F97316] transition">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/marketplace" className="hover:text-[#F97316] transition">Marketplace</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-700 truncate max-w-[55vw]">{product.name}</li>
        </ol>
      </nav>

      <ProductDetailClient params={Promise.resolve({ id: product.id })} />

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-10">
          <h2 className="text-base sm:text-xl font-black text-gray-900 mb-3">Related products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {related.map(function (p) {
              return (
                <Link
                  key={p.id}
                  href={productPath(p)}
                  className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-[#F97316] transition"
                >
                  {p.images[0] && (
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full aspect-square object-cover" />
                  )}
                  <div className="p-2.5">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</p>
                    {p.place && <p className="text-[11px] text-gray-500 mt-0.5">{p.place}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}