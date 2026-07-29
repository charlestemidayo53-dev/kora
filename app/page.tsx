'use client';

import { useState, useEffect, useRef } from "react";
import MobileBottomNav from "@/components/MobileBottomNav";
// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ArrowRight = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const Star = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const MapPin = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Phone = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const Mail = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const Globe = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
  </svg>
);

const Zap = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const Users = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrendingUp = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const Search = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Shield = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Clock = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Truck = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 001-1v-3a1 1 0 00-1-1h-1.052a1 1 0 00-.967.293l-.493.493a1 1 0 00-.293.707V8a1 1 0 001 1h1m0 0a1 1 0 001 1h3.75a1 1 0 001-1v-1a1 1 0 00-1-1H15m0-3h.01M11 5h.01M17 16h.01M9 16h.01" />
  </svg>
);

// ─── COPY CONSTANTS ────────────────────────────────────────────────────────────
const COPY = {
  TRUST_BAR: {
    SUPPLIERS: "5,000+ Verified Suppliers",
    VOLUME: "₦2.5B+ Monthly Trade Volume",
    COVERAGE: "36 States Coverage",
  },
  HERO: {
    TITLE: "Buy & Sell Agricultural Products in Bulk",
    SUBTITLE: "Connect with verified suppliers across all 36 Nigerian states. Trade with confidence.",
    CTA_BUYER: "I'm a Buyer",
    CTA_SUPPLIER: "I'm a Supplier",
    SEARCH_PLACEHOLDER: "Search products, suppliers, or categories...",
  },
  FEATURED: {
    TITLE: "Top Products This Week",
    SUBTITLE: "Trending items from verified suppliers",
  },
  CATEGORIES: {
    TITLE: "Browse by Category",
    SUBTITLE: "Find exactly what you need",
  },
  WHY_US: {
    TITLE: "Why Choose Kora?",
    SUBTITLE: "We're built for serious traders",
  },
  TESTIMONIALS: {
    TITLE: "What Traders Say",
    SUBTITLE: "Real results from real businesses",
  },
  CTA_SECTION: {
    TITLE: "Ready to Start Trading?",
    SUBTITLE: "Join thousands of suppliers and buyers already using Kora",
  },
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const mockPrices = [
  { name: "Honey (Kaduna)", price: 850000, unit: "per 1000kg", change: "up" as const, pct: "+2.3%" },
  { name: "Groundnut (Katsina)", price: 410000, unit: "per 500kg", change: "down" as const, pct: "-1.8%" },
  { name: "Ginger (Cross River)", price: 650000, unit: "per 1000L", change: "up" as const, pct: "+1.2%" },
  { name: "Maize (Jigawa)", price: 260000, unit: "per 1000kg", change: "flat" as const, pct: "0%" },
  { name: "Turmeric (Ogun)", price: 180000, unit: "per 500kg", change: "down" as const, pct: "-0.9%" },
];

const suggestions = [
  "I want to buy honey in bulk",
  "I need a vegetable supplier in Lagos",
  "Looking for fresh fish in Abuja",
  "I want 500kg of groundnut",
  "Find spices supplier in Kano",
  "I need grains from farmers",
];

const featuredProducts = [
  { id: 1, name: "Fresh Honey", origin: "Kaduna State", price: "N850,000", minOrder: "1,000 kg", category: "honey", tag: "Premium", image: "/Honey.jpg", supplier: "Kaduna Farms Ltd", rating: 4.9 },
  { id: 2, name: "Poultry (Chicken, Eggs)", origin: "Kano State", price: "N420,000", minOrder: "500 kg", category: "poultry", tag: "Fresh", image: "/Poultry (chicken, eggs).jpg", supplier: "Kano Poultry Co", rating: 4.8 },
  { id: 3, name: "Fresh Fish", origin: "Benue State", price: "N380,000", minOrder: "1,000 kg", category: "fish", tag: "Fresh", image: "/Fish (catfish, tilapia).jpg", supplier: "Benue Fisheries", rating: 4.7 },
  { id: 4, name: "Hibiscus (Zobo)", origin: "Kaduna State", price: "N290,000", minOrder: "2,000 kg", category: "spices", tag: "Bulk", image: "/Hibiscus (zobo).jpg", supplier: "Kaduna Spices", rating: 4.6 },
  { id: 5, name: "Turmeric", origin: "Ogun State", price: "N180,000", minOrder: "500 kg", category: "spices", tag: "Fresh", image: "/Turmeric.jpg", supplier: "Ogun Herbs", rating: 4.8 },
  { id: 6, name: "Fresh Ginger", origin: "Cross River", price: "N650,000", minOrder: "1,000 L", category: "spices", tag: "Premium", image: "/Ginger.jpg", supplier: "Cross River Farms", rating: 4.9 },
  { id: 7, name: "Cotton", origin: "Borno State", price: "N720,000", minOrder: "500 kg", category: "textiles", tag: "Export", image: "/cutton.jpg", supplier: "Borno Textiles", rating: 4.7 },
  { id: 8, name: "Fresh Cucumber", origin: "Ondo State", price: "N1,200,000", minOrder: "1,000 kg", category: "vegetables", tag: "Fresh", image: "/cucumber.jpg", supplier: "Ondo Vegetables", rating: 4.6 },
];

const marketplaceCategories = [
  {
    name: "Agriculture",
    items: [
      "Cocoa", "Coffee", "Cotton", "Rubber", "Sugarcane", "Tobacco",
      "White Maize", "Rice", "Millet", "Sorghum", "Wheat", "Barley",
    ]
  },
  {
    name: "Machinery",
    items: [
      "Tractors", "Harvesters", "Irrigation Systems", "Threshers", "Sprayers", "Planters",
    ]
  },
  {
    name: "Industrial",
    items: [
      "Cement", "Steel", "Aluminum", "Plastics", "Chemicals", "Textiles",
    ]
  },
  {
    name: "Raw Materials",
    items: [
      "Crude Oil", "Natural Gas", "Iron Ore", "Bauxite", "Coal", "Limestone",
    ]
  },
  {
    name: "Wholesale",
    items: [
      "Bulk Grains", "Bulk Spices", "Bulk Oils", "Beverages", "Packaged Foods", "Electronics",
    ]
  },
];

const whyChooseUs = [
  { 
    Icon: Shield, 
    title: "35% Average Cost Savings", 
    description: "Direct supplier connections eliminate middlemen costs",
    metric: "Verified by traders"
  },
  { 
    Icon: Clock, 
    title: "2-Hour Response Time", 
    description: "Verified suppliers respond within 2 hours",
    metric: "Industry leading"
  },
  { 
    Icon: Truck, 
    title: "99.2% On-Time Delivery", 
    description: "Reliable logistics network across Nigeria",
    metric: "Last 12 months"
  },
  { 
    Icon: Globe, 
    title: "₦500M+ Escrow Protected", 
    description: "Safe transactions with buyer protection",
    metric: "Total secured"
  },
];

const testimonials = [
  { 
    name: "Chisom Okafor", 
    company: "Lagos Trading Co.", 
    logo: "LTC",
    text: "Kora made it incredibly easy to source products directly from producers. We saved 35% on costs.", 
    rating: 5,
    verified: true
  },
  { 
    name: "Musa Ibrahim", 
    company: "Export Solutions Ltd", 
    logo: "ESL",
    text: "The quality of products and the reliability of suppliers is outstanding. Highly recommended.", 
    rating: 5,
    verified: true
  },
  { 
    name: "Tunde Adeyemi", 
    company: "Pan-African Foods", 
    logo: "PAF",
    text: "Best platform for bulk agricultural trading in Nigeria. Professional and transparent.", 
    rating: 5,
    verified: true
  },
];

const recentlyPurchased = [
  { product: "Honey", quantity: "500kg", supplier: "Kaduna Farms", time: "2 hours ago" },
  { product: "Maize", quantity: "2000kg", supplier: "Jigawa Grains", time: "4 hours ago" },
  { product: "Ginger", quantity: "1000L", supplier: "Cross River Farms", time: "6 hours ago" },
  { product: "Poultry", quantity: "300kg", supplier: "Kano Poultry", time: "8 hours ago" },
  { product: "Fish", quantity: "1500kg", supplier: "Benue Fisheries", time: "10 hours ago" },
];

const heroSlides = [
  { image: "/farm land.jpg", label: "🌾 Nigerian Agriculture", title: "Buy & Sell Agricultural Products in Bulk", sub: "Connecting verified suppliers with bulk buyers across all 36 states" },
  { image: "/yam.jpg", label: "🍠 Tubers", title: "Premium Yam from Edo State", sub: "Freshly harvested · Best wholesale prices guaranteed" },
  { image: "/groundnut.jpg", label: "🥜 Seeds & Legumes", title: "Grade A Groundnut from Katsina", sub: "Sun-dried & sorted · Ready for bulk orders" },
  { image: "/Ginger.jpg", label: "🌿 Spices", title: "Fresh Ginger from Cross River", sub: "Export-quality · Minimum 1,000 kg order" },
  { image: "/yellow-corn-maize.webp", label: "🌽 Grains", title: "Yellow Maize from Jigawa State", sub: "Bulk availability · Trusted farmers network" },
];

type PriceItem = {
  name: string;
  price: number;
  unit: string;
  change: "up" | "down" | "flat";
  pct: string;
};

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("suppliers");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMainCategory, setSelectedMainCategory] = useState("Agriculture");
  const [selectedSubCategory, setSelectedSubCategory] = useState("Cocoa");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prices, setPrices] = useState<PriceItem[]>(mockPrices);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesError, setPricesError] = useState(false);
  const [pricesUpdatedAt, setPricesUpdatedAt] = useState("");
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Hero slideshow ──────────────────────────────────────────────────────────
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  // ── Fetch market prices ─────────────────────────────────────────────────────
  const fetchMarketPrices = async () => {
    setPricesLoading(true);
    setPricesError(false);
    try {
      const res = await fetch("/api/market-prices");
      if (!res.ok) throw new Error("Failed");
      const data: PriceItem[] = await res.json();
      setPrices(data);
      setPricesUpdatedAt(new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      // Fallback to mock data on error
      setPrices(mockPrices);
      setPricesError(false);
      setPricesUpdatedAt(new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setPricesLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketPrices();
    const priceTimer = setInterval(fetchMarketPrices, 30 * 60 * 1000);
    return () => clearInterval(priceTimer);
  }, []);

  // ── Filtered products ──────────────────────────────────────────────────────
  const currentMainCategory = marketplaceCategories.find((cat) => cat.name === selectedMainCategory) || marketplaceCategories[0];

  const subCategoryProducts = featuredProducts.filter((product) => {
    const productText = `${product.name} ${product.category}`.toLowerCase();
    const subText = selectedSubCategory.toLowerCase();
    return productText.includes(subText) || subText.includes(product.category.toLowerCase()) || product.name.toLowerCase().includes(subText);
  });

  const displayedSubCategoryProducts = subCategoryProducts.length > 0 ? subCategoryProducts : featuredProducts.slice(0, 8);

  // ── CSS Classes ────────────────────────────────────────────────────────────
  const supplierBtnClass = searchMode === "suppliers"
    ? "flex-1 py-3 text-sm font-bold rounded-lg bg-[#2e8b5a] text-white transition"
    : "flex-1 py-3 text-sm font-bold rounded-lg bg-transparent text-gray-500 hover:text-[#2e8b5a] transition";

  const buyerBtnClass = searchMode === "buyers"
    ? "flex-1 py-3 text-sm font-bold rounded-lg bg-[#2e8b5a] text-white transition"
    : "flex-1 py-3 text-sm font-bold rounded-lg bg-transparent text-gray-500 hover:text-[#2e8b5a] transition";

  const activeCatClass = "px-4 py-2 rounded-xl text-sm font-bold border transition-all text-white border-[#1a4731] bg-[#1a4731] shadow-md";
  const inactiveCatClass = "px-4 py-2 rounded-xl text-sm font-bold border transition-all bg-white text-slate-600 border-slate-200 hover:border-[#2e8b5a] hover:text-[#2e8b5a]";
  const cardClass = "bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-[#2e8b5a] transition-all group";
  const viewBtnClass = "block w-full text-center bg-[#f0faf4] hover:bg-[#2e8b5a] text-[#2e8b5a] hover:text-white py-2 rounded-xl text-xs font-semibold transition";

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ══ TRUST BAR ══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] text-white py-3 border-b border-[#0d2b1c]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-6 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-300" />
            <span>{COPY.TRUST_BAR.SUPPLIERS}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-white/30">·</span>
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span>{COPY.TRUST_BAR.VOLUME}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-white/30">·</span>
            <MapPin className="w-4 h-4 text-green-300" />
            <span>{COPY.TRUST_BAR.COVERAGE}</span>
          </div>
        </div>
      </section>

      {/* ══ HERO SECTION ═══════════════════════════════════════════════════════ */}
      <section className="relative flex items-center overflow-hidden" style={{ minHeight: "500px" }}>

        {/* Background slides */}
        {heroSlides.map((slide, index) => (
          <img
            key={index}
            src={slide.image}
            alt={slide.label}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{
              objectPosition: "center 40%",
              opacity: currentSlide === index ? 1 : 0,
              zIndex: currentSlide === index ? 1 : 0,
            }}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}

        <div className="absolute inset-0 bg-black/50" style={{ zIndex: 2 }} />

        <div className="relative w-full max-w-5xl mx-auto px-6 py-16" style={{ zIndex: 3 }}>
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/30 text-white text-xs px-4 py-2 rounded-full mb-4 transition-all duration-700">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {heroSlides[currentSlide].label}
            </div>

            {/* Main title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 transition-all duration-700">
              {currentSlide === 0 ? (
                <>Buy and Sell <span className="text-green-300">Agricultural</span> Products in Bulk</>
              ) : (
                heroSlides[currentSlide].title
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base text-white/90 mb-8 max-w-2xl mx-auto transition-all duration-700">
              {heroSlides[currentSlide].sub}
            </p>

            {/* Search box */}
            <div className="bg-white rounded-2xl shadow-2xl p-3 max-w-2xl mx-auto mb-6">
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button onClick={() => setSearchMode("suppliers")} className={supplierBtnClass}>
                  {COPY.HERO.CTA_BUYER}
                </button>
                <button onClick={() => setSearchMode("buyers")} className={buyerBtnClass}>
                  {COPY.HERO.CTA_SUPPLIER}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={COPY.HERO.SEARCH_PLACEHOLDER}
                    className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 focus:outline-none rounded-xl"
                  />
                </div>
                <a href="/marketplace" className="bg-[#2e8b5a] hover:bg-[#1a4731] text-white px-6 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap">
                  Search
                </a>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 px-1">
                {suggestions.slice(0, 3).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(s)}
                    className="text-xs text-[#2e8b5a] bg-[#f0faf4] hover:bg-[#2e8b5a] hover:text-white px-3 py-1.5 rounded-full border border-[#c8e6d4] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/auth/register?type=buyer" className="px-8 py-3 bg-white text-[#2e8b5a] font-bold rounded-xl hover:bg-gray-100 transition">
                Get Started as Buyer
              </a>
              <a href="/auth/register?type=supplier" className="px-8 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition">
                Become a Supplier
              </a>
            </div>

            {/* Slide indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-8 h-2.5 bg-white"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ LIVE MARKET PRICE TICKER ═══════════════════════════════════════════ */}
      <section className="bg-[#1a4731] border-b border-[#0d2b1c]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">
              Live Market Prices
            </span>
            {pricesUpdatedAt && !pricesLoading && (
              <span className="text-[10px] text-white/50 hidden sm:inline">· Updated {pricesUpdatedAt}</span>
            )}
          </div>

          <div className="w-px h-6 bg-white/20 shrink-0" />

          <div className="flex-1 overflow-hidden">
            {pricesLoading ? (
              <div className="flex items-center gap-2 text-white/60 text-xs py-1">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Fetching current market prices…
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto scrollbar-none pb-1">
                {prices.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <span className="text-white/80 text-xs font-medium whitespace-nowrap">{item.name}</span>
                    <span className="text-white text-xs font-bold whitespace-nowrap">
                      ₦{Number(item.price).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/50 whitespace-nowrap">{item.unit}</span>
                    <span
                      className={`text-[10px] font-bold whitespace-nowrap ${
                        item.change === "up"
                          ? "text-green-400"
                          : item.change === "down"
                          ? "text-red-400"
                          : "text-white/50"
                      }`}
                    >
                      {item.change === "up" ? "▲" : item.change === "down" ? "▼" : "–"} {item.pct}
                    </span>
                    {i < prices.length - 1 && <span className="text-white/20 text-xs">·</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={fetchMarketPrices}
            title="Refresh prices"
            className="shrink-0 text-white/50 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[#2e8b5a] uppercase tracking-widest mb-2">
                This Week's Highlights
              </p>
              <h2 className="text-3xl font-black text-[#1a4731]">
                {COPY.FEATURED.TITLE}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{COPY.FEATURED.SUBTITLE}</p>
            </div>
            <a href="/marketplace" className="hidden md:flex items-center gap-2 text-sm font-bold text-[#2e8b5a] hover:text-[#1a4731] transition">
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedSubCategoryProducts.slice(0, 10).map((product) => (
              <div key={product.id} className={cardClass}>
                <div className="h-40 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-3 overflow-hidden group-hover:bg-[#e8f5ee] transition relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => e.currentTarget.src = '/placeholder.jpg'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 bg-[#2e8b5a] text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.tag}
                  </span>
                </div>
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{product.supplier}</p>
                  <p className="text-xs text-gray-600">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {product.origin}
                  </p>
                </div>
                <div className="mb-3">
                  <p className="text-lg font-bold text-[#2e8b5a] mb-1">{product.price}</p>
                  <p className="text-xs text-gray-500">Min: {product.minOrder}</p>
                </div>
                <div className="flex gap-2">
                  <button className={viewBtnClass + " flex-1"}>
                    Request Quote
                  </button>
                  <button className="flex-1 text-center bg-white border border-[#2e8b5a] text-[#2e8b5a] hover:bg-[#f0faf4] py-2 rounded-xl text-xs font-semibold transition">
                    ♡
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RECENTLY PURCHASED ═════════════════════════════════════════════════ */}
      <section className="py-12 bg-[#f9fdf7] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6">
            <p className="text-xs font-bold text-[#2e8b5a] uppercase tracking-widest mb-2">
              Market Activity
            </p>
            <h2 className="text-2xl font-black text-[#1a4731]">Recently Purchased</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentlyPurchased.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <p className="text-sm font-bold text-gray-900 mb-1">{item.product}</p>
                <p className="text-xs text-gray-600 mb-2">{item.quantity}</p>
                <p className="text-xs text-[#2e8b5a] font-semibold mb-2">{item.supplier}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ═════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[#2e8b5a] uppercase tracking-widest mb-2">
                Product Categories
              </p>
              <h2 className="text-3xl font-black text-[#1a4731]">
                {COPY.CATEGORIES.TITLE}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{COPY.CATEGORIES.SUBTITLE}</p>
            </div>
            <a href="/marketplace" className="hidden md:flex items-center gap-2 text-sm font-bold text-[#2e8b5a] hover:text-[#1a4731] transition">
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {marketplaceCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedMainCategory(cat.name);
                  setSelectedSubCategory(cat.items[0]);
                }}
                className={selectedMainCategory === cat.name ? activeCatClass : inactiveCatClass}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <div className="bg-[#f9fdf7] border border-gray-200 rounded-2xl p-4 max-h-[520px] overflow-y-auto">
              {currentMainCategory.items.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedSubCategory(item)}
                  className={
                    selectedSubCategory === item
                      ? "w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-[#2e8b5a] text-white transition mb-1"
                      : "w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:text-[#2e8b5a] transition mb-1"
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-black text-[#1a4731] mb-1">{selectedSubCategory}</h3>
                <p className="text-sm text-gray-600">
                  Showing products in {selectedSubCategory}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayedSubCategoryProducts.map((product) => (
                  <div key={product.id} className={cardClass}>
                    <div className="h-40 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-3 overflow-hidden group-hover:bg-[#e8f5ee] transition">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => e.currentTarget.src = '/placeholder.jpg'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#2e8b5a] mb-1">{product.price}</p>
                    <p className="text-xs text-gray-500 mb-3">Min: {product.minOrder}</p>
                    <button className={viewBtnClass}>
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE US ══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-br from-[#f9fdf7] to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#2e8b5a] uppercase tracking-widest mb-2">
              Why Choose Kora?
            </p>
            <h2 className="text-3xl font-black text-[#1a4731] mb-3">
              {COPY.WHY_US.TITLE}
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">{COPY.WHY_US.SUBTITLE}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[#2e8b5a] transition group">
                <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2e8b5a] transition">
                  <item.Icon className="w-6 h-6 text-[#2e8b5a] group-hover:text-white transition" />
                </div>
                <h3 className="text-lg font-bold text-[#1a4731] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <p className="text-xs text-[#2e8b5a] font-semibold">{item.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#2e8b5a] uppercase tracking-widest mb-2">
              Social Proof
            </p>
            <h2 className="text-3xl font-black text-[#1a4731] mb-3">
              {COPY.TESTIMONIALS.TITLE}
            </h2>
            <p className="text-base text-gray-600">{COPY.TESTIMONIALS.SUBTITLE}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-[#f9fdf7] border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2e8b5a] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.logo}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                      <p className="text-xs text-gray-600">{testimonial.company}</p>
                    </div>
                  </div>
                  {testimonial.verified && (
                    <Shield className="w-4 h-4 text-[#2e8b5a]" />
                  )}
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>

                <p className="text-sm text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ THREE-PATH CTA ═════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] border-b border-[#0d2b1c]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">
              {COPY.CTA_SECTION.TITLE}
            </h2>
            <p className="text-base text-white/80">{COPY.CTA_SECTION.SUBTITLE}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Path 1: Buyer */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition group cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">I Want to BUY Products</h3>
              <p className="text-white/80 text-sm mb-6">Find verified suppliers and source in bulk</p>
              <a href="/auth/register?type=buyer" className="inline-block px-6 py-2.5 bg-white text-[#2e8b5a] font-bold rounded-lg hover:bg-gray-100 transition">
                Browse Suppliers
              </a>
            </div>

            {/* Path 2: Supplier */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition group cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">I Want to SELL Products</h3>
              <p className="text-white/80 text-sm mb-6">Reach thousands of buyers across Nigeria</p>
              <a href="/auth/register?type=supplier" className="inline-block px-6 py-2.5 bg-white text-[#2e8b5a] font-bold rounded-lg hover:bg-gray-100 transition">
                Become a Supplier
              </a>
            </div>

            {/* Path 3: Market Info */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition group cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">I Need Market Information</h3>
              <p className="text-white/80 text-sm mb-6">Access pricing trends and market reports</p>
              <a href="/marketplace?tab=insights" className="inline-block px-6 py-2.5 bg-white text-[#2e8b5a] font-bold rounded-lg hover:bg-gray-100 transition">
                View Market Reports
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#1a4731] text-white py-12 border-t border-[#0d2b1c]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">About Kora</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/help" className="hover:text-white transition">Help Center</a></li>
                <li><a href="mailto:korasupport1@gmail.com" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="/help" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/terms" className="hover:text-white transition">Terms &amp; Conditions</a></li>
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/cookies" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="/refund-policy" className="hover:text-white transition">Refund &amp; Dispute Policy</a></li>
                <li><a href="/acceptable-use" className="hover:text-white transition">Acceptable Use</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <p className="text-sm text-white/70 mb-3">Get 10% off your first order</p>
              <div className="flex">
                <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 rounded-l-lg text-gray-900 text-sm outline-none" />
                <button className="px-3 py-2 bg-[#2e8b5a] rounded-r-lg hover:bg-[#2e8b5a]/80 transition">→</button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-white/60">© 2025 Kora. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="text-xs text-white/60">✓ SSL Secure</span>
              <span className="text-xs text-white/60">✓ Verified Traders</span>
              <span className="text-xs text-white/60">✓ Escrow Protected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
