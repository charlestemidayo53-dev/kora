import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import ProductGrid from "@/components/seo/ProductGrid";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import SupplierJsonLd from "@/components/seo/SupplierJsonLd";
import { getSupplierPageData } from "@/lib/seo/data";
import { categoryPath } from "@/lib/seo/category";
import { truncate, joinList, plural } from "@/lib/seo/product";
import type { SupplierSummary } from "@/lib/seo/supplier";
import { createMetadata, absoluteUrl } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

function isVerified(summary: SupplierSummary, level: string | null | undefined): boolean {
  return summary.isVerified || /level\s*[12]/i.test(level || "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSupplierPageData(slug);
  if (!data) {
    return createMetadata({ title: "Supplier not found", path: "/suppliers/" + slug, noIndex: true });
  }
  const { summary, products, profile } = data;
  const place = summary.place || (profile && (profile.state || profile.city)) || null;
  const topCat = summary.categories[0] ? summary.categories[0].name : null;
  const verified = isVerified(summary, profile ? profile.verificationLevel : null);
  const title =
    truncate(summary.name, 40, false) + " - " + (topCat ? topCat + " " : "") + "Supplier" + (place ? " in " + place : "");
  const sample = products.slice(0, 3).map(function (p) { return p.name; });
  const description = truncate(
    summary.name + " is a " + (verified ? "verified " : "") + "supplier on Kora" + (place ? " based in " + place : "") +
      ", listing " + plural(summary.productCount, "product") + (sample.length ? " including " + joinList(sample) : "") +
      ". Request quotes and discuss bulk orders directly.",
    158,
  );
  return createMetadata({
    title: title,
    description: description,
    path: "/suppliers/" + summary.slug,
    image: products[0] ? products[0].images[0] : undefined,
  });
}

export default async function SupplierPage({ params }: Props) {
  const { slug } = await params;
  const data = await getSupplierPageData(slug);
  if (!data) notFound();
  const { summary, products, profile } = data;
  if (slug !== summary.slug) permanentRedirect("/suppliers/" + summary.slug);

  const place = summary.place || (profile && (profile.state || profile.city)) || null;
  const verified = isVerified(summary, profile ? profile.verificationLevel : null);

  const facts: { label: string; value: string }[] = [];
  if (place) facts.push({ label: "Location", value: place });
  if (profile && profile.country) facts.push({ label: "Country", value: profile.country });
  if (profile && profile.yearEstablished) facts.push({ label: "Established", value: profile.yearEstablished });
  if (profile && profile.exportCapable) facts.push({ label: "Export capable", value: profile.exportCapable });
  if (profile && profile.mainProducts) facts.push({ label: "Main products", value: profile.mainProducts });
  facts.push({ label: "Products on Kora", value: String(summary.productCount) });

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <SupplierJsonLd
        name={summary.name}
        url={absoluteUrl("/suppliers/" + summary.slug)}
        description={profile ? profile.description : null}
        region={place}
        country={profile ? profile.country : null}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Suppliers", path: "/suppliers" },
          { name: summary.name, path: "/suppliers/" + summary.slug },
        ]}
      />
      <Breadcrumbs
        items={[{ name: "Home", path: "/" }, { name: "Suppliers", path: "/suppliers" }, { name: summary.name }]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-xl sm:text-3xl font-black text-gray-900">{summary.name}</h1>
          {verified && (
            <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px] font-semibold">
              Verified supplier
            </span>
          )}
        </div>

        {profile && profile.description && (
          <p className="text-sm text-gray-700 mb-5 max-w-3xl">{profile.description}</p>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6 max-w-3xl text-sm">
          {facts.map(function (f) {
            return (
              <div key={f.label} className="flex gap-2">
                <dt className="text-gray-500">{f.label}:</dt>
                <dd className="text-gray-900 font-medium">{f.value}</dd>
              </div>
            );
          })}
        </dl>

        {summary.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {summary.categories.map(function (c) {
              return (
                <Link
                  key={c.slug}
                  href={categoryPath(c.slug)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#F97316] hover:text-[#F97316] transition"
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        )}

        <h2 className="text-base sm:text-xl font-black text-gray-900 mb-3">Products from {summary.name}</h2>
        <ProductGrid products={products} />
      </main>
    </div>
  );
}