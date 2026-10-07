import Link from "next/link";

export default function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 text-[11px] sm:text-xs text-gray-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map(function (item, i) {
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {item.path ? (
                <Link href={item.path} className="hover:text-[#F97316] transition">{item.name}</Link>
              ) : (
                <span className="text-gray-700 truncate max-w-[55vw]">{item.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}