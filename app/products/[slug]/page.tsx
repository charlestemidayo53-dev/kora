import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import ProductGrid from "@/components/seo/ProductGrid";
import { getProductSeoBySlug, getRelatedProducts, getCategorySummaries } from "@/lib/seo/data";
import {
  productPath,
  productSlug,
  productMetaTitle,
  productMetaDescription,
  productIsIndexable,
} from "@/lib/seo/product";
import { categoryPath, type CategorySummary } from "@/lib/seo/category";
import { supplierPath } from "@/lib/seo/supplier";
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

  const indexable = productIsIndexable(product);
  const related = await getRelatedProducts(product);

  let category: CategorySummary | null = null;
  if (indexable && product.categorySlug) {
    try {
      const cats = await getCategorySummaries();
      category =
        cats.find(function (c) { return c.slug === product.categorySlug; }) || null;
    } catch {
      category = null;
    }
  }
  const supplierHref =
    indexable && product.seller && product.supplierKey
      ? supplierPath(product.seller, product.supplierKey)
      : null;

  const crumbs = [
    { name: "Home", path: "/" },
    category
      ? { name: category.name, path: categoryPath(category.slug) }
      : { name: "Marketplace", path: "/marketplace" },
    { name: product.name, path: productPath(product) },
  ];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={crumbs} />

      <Breadcrumbs
        items={[
          { name: crumbs[0].name, path: crumbs[0].path },
          { name: crumbs[1].name, path: crumbs[1].path },
          { name: product.name },
        ]}
      />

      {(category || supplierHref) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 text-[11px] sm:text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
          {category && (
            <span>
              Category:{" "}
              <Link href={categoryPath(category.slug)} className="text-[#F97316] hover:text-[#c2410c] transition">
                {category.name}
              </Link>
            </span>
          )}
          {supplierHref && product.seller && (
            <span>
              Supplier:{" "}
              <Link href={supplierHref} className="text-[#F97316] hover:text-[#c2410c] transition">
                {product.seller}
              </Link>
            </span>
          )}
        </div>
      )}

      <ProductDetailClient params={Promise.resolve({ id: product.id })} />

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-10">
          <h2 className="text-base sm:text-xl font-black text-gray-900 mb-3">Related products</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}