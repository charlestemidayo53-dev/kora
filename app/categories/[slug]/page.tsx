import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import ProductGrid from "@/components/seo/ProductGrid";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { getCategoryPageData } from "@/lib/seo/data";
import { categoryIntro, categoryPath, normalizeCategorySlug } from "@/lib/seo/category";
import { truncate } from "@/lib/seo/product";
import { createMetadata } from "@/lib/seo/metadata";
import { MIN_CATEGORY_PRODUCTS_TO_INDEX } from "@/lib/seo/config";

export const revalidate = 3600;

const MAX_PRODUCTS = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonical = normalizeCategorySlug(slug);
  const data = canonical ? await getCategoryPageData(canonical) : null;
  if (!data) {
    return createMetadata({ title: "Category not found", path: "/categories/" + slug, noIndex: true });
  }
  const s = data.summary;
  return createMetadata({
    title: s.name + " Suppliers in Africa",
    description: truncate(categoryIntro(s), 158),
    path: categoryPath(s.slug),
    image: data.products[0] ? data.products[0].images[0] : undefined,
    noIndex: s.count < MIN_CATEGORY_PRODUCTS_TO_INDEX,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const canonical = normalizeCategorySlug(slug);
  if (!canonical) notFound();
  if (canonical !== slug) permanentRedirect(categoryPath(canonical));

  const data = await getCategoryPageData(canonical);
  if (!data) notFound();
  const { summary, products, suppliers, otherCategories } = data;
  const shown = products.slice(0, MAX_PRODUCTS);

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: summary.name, path: categoryPath(summary.slug) },
        ]}
      />
      <Breadcrumbs
        items={[{ name: "Home", path: "/" }, { name: "Categories", path: "/categories" }, { name: summary.name }]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <h1 className="text-xl sm:text-3xl font-black text-gray-900 mb-2">{summary.name} Suppliers in Africa</h1>
        <p className="text-sm text-gray-600 mb-6 max-w-3xl">{categoryIntro(summary)}</p>

        <ProductGrid products={shown} />
        {products.length > shown.length && (
          <p className="mt-4 text-sm">
            <Link href="/products" className="font-semibold text-[#F97316] hover:text-[#c2410c] transition">
              View all products
            </Link>
          </p>
        )}

        {suppliers.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base sm:text-xl font-black text-gray-900 mb-3">Suppliers in {summary.name}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {suppliers.map(function (s) {
                return (
                  <li key={s.key}>
                    <Link
                      href={"/suppliers/" + s.slug}
                      className="block bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-[#F97316] transition"
                    >
                      <span className="block text-sm font-semibold text-gray-900">{s.name}</span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">
                        {s.place ? s.place + " - " : ""}
                        {s.productCount} {s.productCount === 1 ? "product" : "products"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {otherCategories.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base sm:text-xl font-black text-gray-900 mb-3">Other categories</h2>
            <div className="flex flex-wrap gap-2">
              {otherCategories.map(function (c) {
                return (
                  <Link
                    key={c.slug}
                    href={categoryPath(c.slug)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#F97316] hover:text-[#F97316] transition"
                  >
                    {c.name} ({c.count})
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}