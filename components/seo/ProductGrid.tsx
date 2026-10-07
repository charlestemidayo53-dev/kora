import Link from "next/link";
import { productPath, formatPrice, type SeoProduct } from "@/lib/seo/product";

export default function ProductGrid({ products }: { products: SeoProduct[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
      {products.map(function (p) {
        const price = formatPrice(p);
        return (
          <Link
            key={p.id}
            href={productPath(p)}
            className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-[#F97316] transition"
          >
            {p.images[0] ? (
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="w-full aspect-square object-cover bg-gray-100"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100" />
            )}
            <div className="p-2.5">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</p>
              {p.place && <p className="text-[11px] text-gray-500 mt-0.5">{p.place}</p>}
              {price && <p className="text-xs font-bold text-[#F97316] mt-1">{price}</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}