import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/seo/ProductGrid";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { getProductsPage } from "@/lib/seo/data";
import { categoryPath } from "@/lib/seo/category";
import { createMetadata } from "@/lib/seo/metadata";

const PAGE_SIZE = 36;

type Props = { searchParams: Promise<{ page?: string | string[] }> };

function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(v || "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function pageHref(n: number): string {
  return n > 1 ? "/products?page=" + n : "/products";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  const data = await getProductsPage(page, PAGE_SIZE);
  const suffix = page > 1 ? " - Page " + page : "";
  const count = data.total > 0 ? data.total + " " : "";
  return createMetadata({
    title: "Bulk Products from African Suppliers" + suffix,
    description:
      "Browse " + count + "bulk agricultural and industrial products from African suppliers, manufacturers and producers on Kora. Compare listings and connect directly with suppliers.",
    path: pageHref(page),
    noIndex: data.total === 0 || page > data.totalPages,
  });
}

export default async function ProductsIndexPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const data = await getProductsPage(page, PAGE_SIZE);
  if (data.total > 0 && page > data.totalPages) notFound();

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ]}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Products" }]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <h1 className="text-xl sm:text-3xl font-black text-gray-900 mb-2">Bulk products from African suppliers</h1>
        <p className="text-sm text-gray-600 mb-5 max-w-3xl">
          Browse products listed by suppliers, manufacturers and producers on Kora, and connect directly to discuss
          quantities, pricing and trade requirements.
        </p>

        {data.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {data.categories.map(function (c) {
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
        )}

        {data.products.length === 0 ? (
          <p className="text-gray-700 font-semibold py-16 text-center">No products listed yet.</p>
        ) : (
          <ProductGrid products={data.products} />
        )}

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 text-sm">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="font-semibold text-[#F97316] hover:text-[#c2410c] transition">
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-gray-500">
              Page {page} of {data.totalPages}
            </span>
            {page < data.totalPages ? (
              <Link href={pageHref(page + 1)} className="font-semibold text-[#F97316] hover:text-[#c2410c] transition">
                Next
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </main>
    </div>
  );
}