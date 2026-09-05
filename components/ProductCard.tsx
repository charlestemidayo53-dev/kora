"use client";

type Product = {
  id?: string;
  name: string;
  price: string;
  location?: string;
  image?: string;
  category?: string;
  description?: string;
  verified?: boolean;
  is_verified?: boolean;
  listing_source?: "internal" | "discovered";
  availability?: "available" | "limited" | "unavailable";
  source_name?: string;
};

function formatNaira(price: string | number | undefined): string {
  if (price === undefined || price === null || price === "") return "N0";
  const numeric =
    typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, ""));
  if (isNaN(numeric)) return "N" + price;
  return "N" + numeric.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function CardHeartIcon({ filled, popping }: { filled: boolean; popping: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={
        "w-5 h-5 transition-transform duration-200 ease-out drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] " +
        (popping ? "scale-125" : "scale-100")
      }
      fill={filled ? "#ef4444" : "none"}
      stroke={filled ? "#ef4444" : "#ffffff"}
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7.5-4.6-10-9.1C.5 8.6 2 5 5.6 5c2 0 3.4 1.1 4.4 2.5C11 6.1 12.4 5 14.4 5 18 5 19.5 8.6 22 11.9 19.5 16.4 12 21 12 21z"
      />
    </svg>
  );
}

function CardVerifiedBadge() {
  return (
    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-white/95 text-green-700 text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">
      <svg viewBox="0 0 24 24" className="w-3 h-3">
        <path
          fill="#15803d"
          d="M12 2l2.4 1.7 2.9-.4 1.1 2.7 2.7 1.1-.4 2.9L22 12l-1.7 2.4.4 2.9-2.7 1.1-1.1 2.7-2.9-.4L12 22l-2.4-1.7-2.9.4-1.1-2.7-2.7-1.1.4-2.9L2 12l1.7-2.4-.4-2.9 2.7-1.1 1.1-2.7 2.9.4L12 2z"
        />
        <path
          d="M8.6 12.3l2 2 4.4-4.6"
          stroke="white"
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified Supplier
    </div>
  );
}

function CardSourcedTag({ product }: { product: Product }) {
  if (product.listing_source !== "discovered") return null;
  const unavailable = product.availability === "unavailable";
  return (
    <div
      className={
        "absolute bottom-1.5 right-1.5 text-[9px] font-bold px-2 py-1 rounded-full shadow-sm " +
        (unavailable ? "bg-white/95 text-gray-500" : "bg-white/95 text-[#c2410c]")
      }
    >
      {unavailable ? "Unavailable" : "Sourced Supply"}
    </div>
  );
}

function CardPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  );
}

export default function ProductCard({
  product,
  wishlisted,
  popping,
  onToggleWishlist,
  onClick,
}: {
  product: Product;
  wishlisted: boolean;
  popping: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const verified = Boolean(product.verified || product.is_verified);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group flex flex-col cursor-pointer"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="h-full flex items-center justify-center text-[10px] font-semibold text-gray-400">No Image</div>
        )}

        <button
          type="button"
          onClick={onToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-1.5 right-1.5 flex items-center justify-center active:scale-90 transition"
        >
          <CardHeartIcon filled={wishlisted} popping={popping} />
        </button>

        {verified && product.listing_source !== "discovered" && <CardVerifiedBadge />}
        <CardSourcedTag product={product} />
      </div>

      <div className="p-2 sm:p-2.5 flex flex-col flex-1 gap-1">
        <h3 className="text-[11px] sm:text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#F97316]">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-2">{product.description}</p>
        )}

        {product.location && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <CardPinIcon />
            <span className="truncate">{product.location}</span>
          </div>
        )}

        <p className="mt-auto pt-1 text-xs sm:text-sm font-bold text-[#F97316]">
          {formatNaira(product.price)}
        </p>
      </div>
    </div>
  );
}
