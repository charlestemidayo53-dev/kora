"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { getProducts } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { buildFlutterwaveConfig } from "@/lib/payments/flutterwave-client";

type Product = {
  id?: string;
  name: string;
  price: string;
  location?: string;
  quantity?: string;
  available_quantity?: string | number;
  image?: string;
  category?: string;
  seller?: string;
  company_name?: string;
  owner: string;
  moq?: string | number;
  minimum_order_quantity?: string | number;
  unit?: string;
  verified?: boolean;
  is_verified?: boolean;
  description?: string;
};

// Expanded promotional hero slides — covers more of Kora's feature set than
// the previous 3 (sourcing, escrow, adding products), now also spotlighting
// verified suppliers, mobile trading, and nationwide agricultural reach.
const banners = [
  {
    eyebrow: "Kora Sourcing",
    title: "Find verified suppliers faster",
    body: "Compare products, message sellers, and place secure orders from one marketplace.",
    cta: "Start sourcing",
    href: "#products",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Secure Trading",
    title: "Buy farm inputs with confidence",
    body: "Use Kora to discover sellers, check stock details, and keep your business moving.",
    cta: "Browse products",
    href: "#products",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Trade On the Go",
    title: "Run your business from your phone",
    body: "Manage orders, chat with buyers, and track sales anywhere — Kora is built mobile-first.",
    cta: "Open dashboard",
    href: "/dashboard",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Verified Suppliers",
    title: "Every supplier screened before listing",
    body: "Trade with confidence — Kora verifies business details before sellers go live.",
    cta: "Meet our suppliers",
    href: "/suppliers",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Nationwide Reach",
    title: "From the farm to every Nigerian state",
    body: "Source agricultural products and raw materials from sellers across all 36 states.",
    cta: "Explore categories",
    href: "/categories",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Seller Tools",
    title: "Show buyers what you have in stock",
    body: "List products with MOQ, units, location, and company details buyers need before ordering.",
    cta: "Add product",
    href: "/add-product",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6]">
        <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomePageInner />
    </Suspense>
  );
}

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeBanner, setActiveBanner] = useState(0);

  // Flutterwave checkout state — set once /api/payments/initiate returns,
  // then the effect below opens the actual checkout modal. Kept separate
  // from `buyingId` (which just drives the button's disabled/loading look).
  const [payConfig, setPayConfig] = useState<any>(null);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const handleFlutterPayment = useFlutterwave(
    payConfig || {
      public_key: "",
      tx_ref: "",
      amount: 0,
      currency: "NGN",
      payment_options: "card",
      customer: { email: "", name: "" },
      customizations: {},
    }
  );

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      await loadProducts();
    }

    init();
  }, []);

  // Picks up ?q= if ever linked to from elsewhere with a query param — this
  // is now the site's one and only search bar (the duplicate top bar in
  // SiteShell has been removed), so it's also the sole source of `search`.
  useEffect(function () {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(function () {
    const timer = window.setInterval(function () {
      setActiveBanner(function (current) {
        return (current + 1) % banners.length;
      });
    }, 4500);

    return function () {
      window.clearInterval(timer);
    };
  }, []);

  // Opens Flutterwave Checkout as soon as payConfig is set (right after
  // /api/payments/initiate returns). Kept in an effect rather than called
  // directly inside handleBuy because useFlutterwave's returned function
  // is re-created on every render based on the *current* payConfig — so we
  // wait for the state update (and resulting re-render) to land first,
  // otherwise this would fire with the previous (stale) config.
  useEffect(function () {
    if (!payConfig || !pendingProductId) return;

    handleFlutterPayment({
      callback: async function (response: any) {
        closePaymentModal();

        if (response.status === "successful") {
          await verifyPayment(response.transaction_id);
        } else {
          alert("Payment was not completed. Please try again.");
        }

        setPayConfig(null);
        setPendingProductId(null);
        setBuyingId(null);
      },
      onClose: function () {
        // Buyer closed the checkout without completing payment — no order
        // is created, matching "if payment fails or is cancelled, do not
        // create an order."
        setPayConfig(null);
        setPendingProductId(null);
        setBuyingId(null);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payConfig, pendingProductId]);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(function () {
    return products.filter(function (product) {
      const name = product?.name || "";
      const location = product?.location || "";
      const seller = product?.seller || product?.company_name || "";
      const category = product?.category || "";
      const description = product?.description || "";

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        location.toLowerCase().includes(search.toLowerCase()) ||
        seller.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [products, search]);

  // Replaces the old "create a pending order immediately" flow. Now:
  // 1. Ask the server to initiate a payment (it re-fetches the real price
  //    and generates a unique tx_ref — the client never supplies the amount).
  // 2. Open Flutterwave Checkout with that server-issued tx_ref/amount.
  // 3. Only after the server verifies the payment (see verifyPayment below)
  //    does an order ever get created.
  async function handleBuy(product: Product) {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.email === product.owner) {
      alert("You cannot buy your own product!");
      return;
    }

    setBuyingId(product.id || null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        router.push("/auth/login");
        setBuyingId(null);
        return;
      }

      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, accessToken }),
      });
      const initData = await res.json();
      if (!res.ok) throw new Error(initData.error || "Could not start payment.");

      setPendingProductId(product.id || null);
      setPayConfig(
        buildFlutterwaveConfig({
          txRef: initData.tx_ref,
          amount: initData.amount,
          currency: initData.currency,
          customerEmail: initData.customer.email,
          customerName: initData.customer.name,
          description: "Payment for " + product.name,
        })
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start payment. Please try again.");
      setBuyingId(null);
    }
  }

  // Called from the checkout success callback. The server re-verifies with
  // Flutterwave using the secret key and only then creates the order.
  async function verifyPayment(transactionId: number) {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: transactionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment verification failed.");

      alert("Payment successful! Your order has been placed.");
    } catch (err: any) {
      console.error(err);
      alert(
        err.message ||
          "We couldn't confirm your payment. If you were charged, please contact support."
      );
    }
  }

  function stopCardNav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function formatValue(value: string | number | undefined, fallback: string) {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value);
  }

  const messageBtnClass =
    "flex-1 text-center bg-white text-[#2e8b5a] border border-[#2e8b5a] py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#f0faf4] transition";

  const buyBtnClass =
    "flex-1 bg-[#2e8b5a] text-white py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#1a4731] transition disabled:bg-gray-300 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Search products, suppliers, or locations"
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#2e8b5a]"
            />
          </div>
        </div>
      </section>

      {/* Promotional hero — expanded slide set, slightly shorter than before
          so more of the page is visible without scrolling. */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-5">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl min-h-[170px] sm:min-h-[260px] bg-[#173f2a]">
            {banners.map(function (banner, index) {
              const isActive = index === activeBanner;
              return (
                <div
                  key={banner.title}
                  className={"absolute inset-0 transition-opacity duration-700 " + (isActive ? "opacity-100" : "opacity-0 pointer-events-none")}
                >
                  <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
                  <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-10 max-w-2xl text-white">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#c7f5d8] mb-1.5">{banner.eyebrow}</p>
                    <h1 className="text-xl sm:text-4xl font-black leading-tight">{banner.title}</h1>
                    <p className="mt-2 text-xs sm:text-base text-white/85 max-w-xl">{banner.body}</p>
                    <a href={banner.href} className="mt-3 sm:mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-white px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-[#1a4731] hover:bg-[#f0faf4] transition">
                      {banner.cta}
                    </a>
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-3 left-5 sm:left-10 flex gap-2">
              {banners.map(function (_, index) {
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={"Show banner " + (index + 1)}
                    onClick={function () { setActiveBanner(index); }}
                    className={"h-1.5 rounded-full transition-all " + (index === activeBanner ? "w-7 bg-white" : "w-1.5 bg-white/50")}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading marketplace products...</p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-700 text-base font-semibold">No products found.</p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map(function (product, i) {
              const supplierName = product.company_name || product.seller || "Kora supplier";
              const unit = formatValue(product.unit, "unit");
              const moq = formatValue(product.moq || product.minimum_order_quantity, "Ask supplier");
              const available = formatValue(product.available_quantity || product.quantity, "Contact seller");
              const verified = Boolean(product.verified || product.is_verified);

              return (
                <div
                  key={product.id || i}
                  onClick={() => router.push("/product/" + product.id)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden group flex flex-col h-full cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs font-semibold text-gray-400">No Image</div>
                    )}

                    {product.category && (
                      <span className="absolute left-2 top-2 bg-white/95 text-gray-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#2e8b5a]">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-base sm:text-xl font-black text-[#b45309]">NGN {product.price}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
                      <div className="bg-gray-50 rounded-md px-2 py-1.5">
                        <p className="text-gray-400 font-bold uppercase">MOQ</p>
                        <p className="text-gray-800 font-semibold truncate">{moq} {unit}</p>
                      </div>
                      <div className="bg-gray-50 rounded-md px-2 py-1.5">
                        <p className="text-gray-400 font-bold uppercase">Available</p>
                        <p className="text-gray-800 font-semibold truncate">{available} {unit}</p>
                      </div>
                    </div>

                    {product.description && (
                      <p className="mt-3 text-xs sm:text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{supplierName}</p>
                          <p className="text-[11px] sm:text-xs text-gray-500 truncate">{product.location || "Location available on request"}</p>
                        </div>
                        {verified && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded bg-[#e8f5f0] px-2 py-1 text-[10px] font-bold text-[#2e8b5a]">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.7a1 1 0 00-1.4-1.4L9 10.2 7.7 8.9a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <a href={"/message?to=" + encodeURIComponent(product.owner)} onClick={stopCardNav} className={messageBtnClass}>
                        Message
                      </a>
                      <button onClick={function (e) { stopCardNav(e); handleBuy(product); }} disabled={buyingId === product.id} className={buyBtnClass}>
                        {buyingId === product.id ? "..." : "Order"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}