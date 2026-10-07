import Link from "next/link";
import { getHomeSeoData } from "@/lib/seo/data";
import { productPath } from "@/lib/seo/product";
import { categoryPath } from "@/lib/seo/category";

// Crawlable links from the homepage into categories, suppliers and products.
// If the database is unreachable this renders nothing, so the homepage never breaks.
export default async function HomeSeoSection() {
  let data: Awaited<ReturnType<typeof getHomeSeoData>>;
  try {
    data = await getHomeSeoData();
  } catch {
    return null;
  }
  if (!data || data.total === 0) return null;

  const chip =
    "px-3.5 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#F97316] hover:text-[#F97316] transition";

  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {data.categories.length > 0 && (
          <div>
            <h2 className="text-base sm:text-xl font-black text-gray-900 mb-3">Browse by category</h2>
            <div className="flex flex-wrap gap-2">
              {data.categories.map(function (c) {
                return (
                  <Link key={c.slug} href={categoryPath(c.slug)} className={chip}>
                    {c.name} ({c.count})
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {data.suppliers.length > 0 && (
          <div>
            <h2 className="text-base sm:text-xl font-black text-gray-900 mb-3">Suppliers on Kora</h2>
            <div className="flex flex-wrap gap-2">
              {data.suppliers.map(function (s) {
                return (
                  <Link key={s.key} href={"/suppliers/" + s.slug} className={chip}>
                    {s.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-xl font-black text-gray-900">Recently listed</h2>
            <Link href="/products" className="text-xs sm:text-sm font-semibold text-[#F97316] hover:text-[#c2410c] transition">
              View all products
            </Link>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
            {data.latest.map(function (p) {
              return (
                <li key={p.id}>
                  <Link href={productPath(p)} className="text-gray-700 hover:text-[#F97316] transition">
                    {p.name}
                    {p.place ? " - " + p.place : ""}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}