"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import MobileBottomNav from "@/components/MobileBottomNav";
import { usePathname } from "next/navigation";

// ─── Category data ────────────────────────────────────────────────────────────
const categories = [
  {
    name: "Agriculture & Food", slug: "agriculture-food",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22V12M8 6C8 6 7 9 9 11C9 11 11 8 14 8C14 8 13 12 10 13C10 13 13 15 16 13" /><path d="M12 12C12 12 6 10 5 4C5 4 10 4 12 8" /></svg>,
    subcategories: ["Cash Crops","Grains & Cereals","Fruits & Vegetables","Livestock & Poultry","Dairy Products","Seafood & Fishery","Spices & Herbs","Processed Food","Animal Feed","Fertilizers & Inputs","Seeds & Seedlings","Agri Machinery"],
  },
  {
    name: "Apparel & Accessories", slug: "apparel",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20.38 3.46L16 2l-4 4-4-4-4.38 1.46a1 1 0 00-.62.93V7l4 4v12h9V11l4-4V4.39a1 1 0 00-.62-.93z" /></svg>,
    subcategories: ["Men's Clothing","Women's Clothing","Children's Clothing","Traditional Wear","Footwear","Bags & Wallets","Workwear & Uniforms","Sportswear","Wedding Attire","Hats & Caps"],
  },
  {
    name: "Auto, Motorcycle & Parts", slug: "auto-motorcycle",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 17H3a2 2 0 01-2-2v-4l3-6h12l3 6v4a2 2 0 01-2 2h-2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>,
    subcategories: ["Car Engine Parts","Tyres & Wheels","Motorcycle Parts","Body Parts & Panels","Batteries & Electrical","Filters & Belts","Brakes & Suspension","Lubricants & Fluids","Car Care Products"],
  },
  {
    name: "Chemicals", slug: "chemicals",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 3h6v8l4 9H5l4-9V3z" /><path d="M9 12h6" /></svg>,
    subcategories: ["Industrial Chemicals","Agrochemicals","Cleaning Agents","Paint & Coatings","Adhesives & Sealants","Water Treatment","Pharmaceutical Chemicals","Detergents","Solvents"],
  },
  {
    name: "Construction & Decoration", slug: "construction",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 21h18M9 21V9l3-6 3 6v12M3 21V11l6-4M21 21V11l-6-4" /></svg>,
    subcategories: ["Cement & Concrete","Iron Rods & Steel","Roofing Materials","Tiles & Flooring","Doors & Windows","Paints & Finishes","Plumbing Materials","Electrical Fittings","Interior Decor","Granite & Marble"],
  },
  {
    name: "Consumer Electronics", slug: "electronics",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
    subcategories: ["Smartphones","Tablets","Smart TVs","Audio Systems","Cameras","Wearable Devices","Gaming Consoles","Smart Home Devices","Earphones & Headphones","Projectors"],
  },
  {
    name: "Electrical & Electronics", slug: "electrical",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    subcategories: ["Cables & Wires","Switches & Sockets","Circuit Breakers","Transformers","Generators & Inverters","Solar Panels","Electric Motors","LED Modules","Batteries","Control Panels"],
  },
  {
    name: "Furniture", slug: "furniture",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2" /><path d="M2 11a2 2 0 012-2h16a2 2 0 012 2v3H2v-3z" /><path d="M4 14v5M20 14v5M4 19h16" /></svg>,
    subcategories: ["Office Furniture","Home Furniture","School Furniture","Hospital Furniture","Sofas & Couches","Beds & Mattresses","Wardrobes & Cabinets","Tables & Chairs","Outdoor Furniture"],
  },
  {
    name: "Health & Medicine", slug: "health",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    subcategories: ["Pharmaceuticals","Medical Devices","Surgical Equipment","Diagnostic Tools","First Aid Supplies","Vitamins & Supplements","PPE","Dental Products","Lab Equipment"],
  },
  {
    name: "Industrial Equipment", slug: "industrial",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>,
    subcategories: ["Pumps & Valves","Compressors","Hydraulic Equipment","Bearings & Seals","Welding Equipment","Heat Exchangers","Filtration Systems","Safety Equipment"],
  },
  {
    name: "Lights & Lighting", slug: "lighting",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 5.5V16H8v-1.5C6.5 13.5 5 11.5 5 9a7 7 0 017-7z" /></svg>,
    subcategories: ["LED Bulbs","Solar Lights","Street Lights","Indoor Lighting","Outdoor Lighting","Floodlights","Emergency Lights","Chandeliers"],
  },
  {
    name: "Manufacturing Machinery", slug: "machinery",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" /></svg>,
    subcategories: ["Food Processing Machines","Textile Machinery","Packaging Machines","CNC Machines","Metal Fabrication","Printing Machines","Wood Processing","Moulding Equipment"],
  },
  {
    name: "Metallurgy & Energy", slug: "metallurgy",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22V12M20 17l-8 5-8-5V7l8-5 8 5v10z" /><path d="M12 12L4 7M12 12l8-5" /></svg>,
    subcategories: ["Steel & Iron","Aluminium Products","Copper & Brass","Coal & Coke","Crude Oil & Petroleum","Renewable Energy","Mining Equipment","Minerals & Ores"],
  },
  {
    name: "Packaging & Printing", slug: "packaging",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>,
    subcategories: ["Cardboard Boxes","Polythene Bags","Bubble Wrap","Labels & Stickers","Printing Services","Custom Packaging","Woven Sacks","Blister Packs"],
  },
  {
    name: "Security & Protection", slug: "security",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    subcategories: ["CCTV Cameras","Access Control","Alarm Systems","Fire Protection","Biometric Systems","Door Locks & Bolts","Perimeter Fencing","Vehicle Tracking"],
  },
  {
    name: "Textile", slug: "textile",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 3h4v18H3zM10 3h4v18h-4zM17 3h4v18h-4z" /></svg>,
    subcategories: ["Cotton Fabric","Polyester Fabric","Ankara & African Print","Lace & Embroidered Fabric","Denim Fabric","Silk & Satin","Yarn & Thread","Upholstery Fabric"],
  },
  {
    name: "Tools & Hardware", slug: "tools",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z" /></svg>,
    subcategories: ["Hand Tools","Power Tools","Cutting Tools","Measuring Tools","Fasteners & Bolts","Padlocks & Hinges","Welding Tools","Plumbing Tools"],
  },
  {
    name: "Transportation", slug: "transportation",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    subcategories: ["Trucks & Lorries","Buses & Minivans","Motorcycles & Tricycles","Agricultural Vehicles","Forklifts","Electric Vehicles","Spare Parts","Tyres & Batteries"],
  },
];

// ─── Languages ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en",  label: "English",    native: "English"      },
  { code: "yo",  label: "Yoruba",     native: "Yoruba"       },
  { code: "ha",  label: "Hausa",      native: "Hausa"        },
  { code: "ig",  label: "Igbo",       native: "Igbo"         },
  { code: "pcm", label: "Pidgin",     native: "Naija Pidgin" },
  { code: "fr",  label: "French",     native: "Francais"     },
  { code: "sw",  label: "Swahili",    native: "Kiswahili"    },
  { code: "am",  label: "Amharic",    native: "Amharic"      },
  { code: "zu",  label: "Zulu",       native: "isiZulu"      },
  { code: "ar",  label: "Arabic",     native: "Arabic"       },
  { code: "pt",  label: "Portuguese", native: "Portugues"    },
];

// ─── Currencies ───────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "NGN", symbol: "₦",   label: "Nigerian Naira"     },
  { code: "USD", symbol: "$",   label: "US Dollar"          },
  { code: "GBP", symbol: "£",   label: "British Pound"      },
  { code: "EUR", symbol: "€",   label: "Euro"               },
  { code: "GHS", symbol: "GH₵", label: "Ghanaian Cedi"      },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling"    },
  { code: "ZAR", symbol: "R",   label: "South African Rand" },
  { code: "XOF", symbol: "CFA", label: "West African CFA"   },
  { code: "ETB", symbol: "Br",  label: "Ethiopian Birr"     },
];

const navLinks = [
  { label: "Products",      href: "/marketplace"    },
  { label: "Suppliers",     href: "/suppliers"      },
  { label: "Manufacturers", href: "/manufacturers"  },
  { label: "RFQ",           href: "/rfq"            },
  { label: "About Us",      href: "/about"          },
  { label: "Contact",       href: "/contact"        },
];

// ─── SVG icon components ──────────────────────────────────────────────────────
const IconMessage = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconOrders = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconCart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IconStore = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconGlobe = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const IconSignOut = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconLock = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconMenu = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconWallet = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5m-4 0h.01M17 12a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFirstName(profile: any, user: any): string {
  const fullName =
    profile?.full_name ||
    profile?.company_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.business_name ||
    "";
  if (fullName) {
    return fullName.trim().split(" ")[0];
  }
  return "there";
}

function getInitials(profile: any, user: any): string {
  const name =
    profile?.full_name ||
    profile?.company_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.business_name ||
    "";
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map(function (w: string) { return w[0]?.toUpperCase(); })
      .filter(Boolean)
      .join("");
  }
  const email = user?.email || "";
  return email.charAt(0).toUpperCase() || "U";
}

// ─── Site Shell (client) ───────────────────────────────────────────────────────
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [user, setUser]                       = useState<any>(null);
  const [profile, setProfile]                 = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);

  const [language, setLanguage]               = useState("en");
  const [currency, setCurrency]               = useState("NGN");
  const [showLangMenu, setShowLangMenu]       = useState(false);
  const [showCurrMenu, setShowCurrMenu]       = useState(false);
  const [showUserMenu, setShowUserMenu]       = useState(false);

  const [msgCount, setMsgCount]               = useState(0);

  const langRef    = useRef<HTMLDivElement>(null);
  const currRef    = useRef<HTMLDivElement>(null);
  const userRef    = useRef<HTMLDivElement>(null);

  useEffect(function () {
    supabase.auth.getUser().then(function (res) { setUser(res.data?.user || null); });
    const { data: listener } = supabase.auth.onAuthStateChange(function (_event, session) {
      setUser(session?.user || null);
    });
    return function () { listener.subscription.unsubscribe(); };
  }, []);

  useEffect(function () {
    if (!user?.id) { setProfile(null); return; }
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, company_name, avatar_url, role")
        .eq("id", user.id)
        .single();
      setProfile(data || null);
    }
    loadProfile();
  }, [user]);

  useEffect(function () {
    setLanguage(localStorage.getItem("kora_lang") || "en");
    setCurrency(localStorage.getItem("kora_currency") || "NGN");
  }, []);

  useEffect(function () {
    if (!user) { setMsgCount(0); return; }
    async function load() {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_email", user.email)
        .eq("is_read", false);
      setMsgCount(count || 0);
    }
    load();
    const channel = supabase
      .channel("msg-badge")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_email=eq.${user.email}` },
        load
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_email=eq.${user.email}` },
        load
      )
      .subscribe();
    return function () { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(function () {
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (langRef.current && !langRef.current.contains(t))  setShowLangMenu(false);
      if (currRef.current && !currRef.current.contains(t))  setShowCurrMenu(false);
      if (userRef.current && !userRef.current.contains(t))  setShowUserMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return function () { document.removeEventListener("mousedown", handler); };
  }, []);

  function changeLang(code: string)  { setLanguage(code);  localStorage.setItem("kora_lang", code);     setShowLangMenu(false); }
  function changeCurr(code: string)  { setCurrency(code);  localStorage.setItem("kora_currency", code); setShowCurrMenu(false); window.dispatchEvent(new CustomEvent("kora-currency-change", { detail: { currency: code } })); }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    window.location.href = "/";
  }

  const currentLang = LANGUAGES.find(function (l) { return l.code === language; }) || LANGUAGES[0];
  const currentCurr = CURRENCIES.find(function (c) { return c.code === currency; }) || CURRENCIES[0];
  const initials     = getInitials(profile, user);
  const firstName    = getFirstName(profile, user);
  const avatarUrl    = profile?.avatar_url || null;

  // The top row now only ever holds the desktop icon cluster (language,
  // currency, messages, orders, cart, account) since the duplicate search
  // bar that used to live here on the home page has been removed — the one
  // search bar on HomePage.tsx is now the site's only search bar.
  const topRowClass = "hidden md:flex max-w-[1400px] mx-auto px-4 md:px-6 py-3 items-center justify-end gap-3";

  return (
    <>
      {/* ══ MAIN HEADER ══════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">

        {/* ── Top row: Logo + Search + Icons ─────────────────────────────── */}
        <div className={topRowClass}>

          {/* ── Right side icons (desktop only — mobile uses bottom nav) ──── */}
          <div className="hidden md:flex items-center gap-0.5 flex-shrink-0">

            {/* Language picker */}
            <div className="relative" ref={langRef}>
              <button
                onClick={function () { setShowLangMenu(function (v) { return !v; }); setShowCurrMenu(false); setShowUserMenu(false); }}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-gray-600 hover:text-[#2e8b5a] hover:bg-[#f0faf4] rounded-lg transition"
              >
                <IconGlobe />
                <span className="hidden md:inline">{currentLang.code.toUpperCase()}</span>
                <IconChevronDown />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-52 py-1 max-h-80 overflow-y-auto">
                  <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Select Language</p>
                  {LANGUAGES.map(function (lang) {
                    return (
                      <button key={lang.code} onClick={function () { changeLang(lang.code); }}
                        className={"w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-[#f0faf4] transition " + (language === lang.code ? "text-[#2e8b5a] font-bold bg-[#f0faf4]" : "text-gray-700")}>
                        <span>{lang.native}</span>
                        <span className="text-[10px] text-gray-400">{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Currency picker */}
            <div className="relative" ref={currRef}>
              <button
                onClick={function () { setShowCurrMenu(function (v) { return !v; }); setShowLangMenu(false); setShowUserMenu(false); }}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-gray-600 hover:text-[#2e8b5a] hover:bg-[#f0faf4] rounded-lg transition"
              >
                <span>{currentCurr.symbol}</span>
                <span className="hidden md:inline">{currentCurr.code}</span>
                <IconChevronDown />
              </button>
              {showCurrMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-52 py-1 max-h-72 overflow-y-auto">
                  <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Select Currency</p>
                  {CURRENCIES.map(function (cur) {
                    return (
                      <button key={cur.code} onClick={function () { changeCurr(cur.code); }}
                        className={"w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-[#f0faf4] transition " + (currency === cur.code ? "text-[#2e8b5a] font-bold bg-[#f0faf4]" : "text-gray-700")}>
                        <span className="flex items-center gap-2">
                          <span className="font-bold w-7 text-center text-xs">{cur.symbol}</span>
                          <span>{cur.label}</span>
                        </span>
                        <span className="text-[10px] text-gray-400">{cur.code}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="w-px h-7 bg-gray-200 mx-1" />

            {/* Messages — only if logged in */}
            {user && (
              <Link href="/message"
                className="relative flex flex-col items-center px-2.5 py-1.5 text-gray-600 hover:text-[#2e8b5a] hover:bg-[#f0faf4] rounded-lg transition">
                <IconMessage />
                {msgCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {msgCount > 99 ? "99+" : msgCount}
                  </span>
                )}
                <span className="text-[9px] mt-0.5 hidden md:block leading-none">Messages</span>
              </Link>
            )}

            {/* Orders — only if logged in */}
            {user && (
              <Link href="/orders"
                className="flex flex-col items-center px-2.5 py-1.5 text-gray-600 hover:text-[#2e8b5a] hover:bg-[#f0faf4] rounded-lg transition">
                <IconOrders />
                <span className="text-[9px] mt-0.5 hidden md:block leading-none">Orders</span>
              </Link>
            )}

            {/* Cart — only if logged in */}
            {user && (
              <Link href="/cart"
                className="flex flex-col items-center px-2.5 py-1.5 text-gray-600 hover:text-[#2e8b5a] hover:bg-[#f0faf4] rounded-lg transition">
                <IconCart />
                <span className="text-[9px] mt-0.5 hidden md:block leading-none">Cart</span>
              </Link>
            )}

            <div className="w-px h-7 bg-gray-200 mx-1" />

            {/* Account — logged in */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={function () { setShowUserMenu(function (v) { return !v; }); setShowLangMenu(false); setShowCurrMenu(false); }}
                  className="flex flex-col items-center px-2 py-1.5 hover:bg-[#f0faf4] rounded-lg transition"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={firstName} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2e8b5a] to-[#1a4731] flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <span className="text-[9px] mt-0.5 text-gray-500 hidden md:block leading-none">Account</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-56 py-1">
                    <div className="px-3 py-3 border-b border-gray-100 flex items-center gap-2.5">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={firstName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2e8b5a] to-[#1a4731] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">Hi, {firstName}</p>
                        <p className="text-[10px] text-gray-400 capitalize">
                          {profile?.role || user.user_metadata?.role || "Buyer"}
                        </p>
                      </div>
                    </div>

                    {[
                      { label: "My Store",         href: "/dashboard", Icon: <IconStore />    },
                      { label: "Wallet",           href: "/wallet",    Icon: <IconWallet />   },
                      { label: "Profile Settings", href: "/settings",  Icon: <IconSettings /> },
                      { label: "Orders",           href: "/orders",    Icon: <IconOrders />   },
                      { label: "Messages",         href: "/message",   Icon: <IconMessage />  },
                    ].map(function (item) {
                      return (
                        <Link key={item.label} href={item.href} onClick={function () { setShowUserMenu(false); }}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#f0faf4] hover:text-[#2e8b5a] transition">
                          <span className="text-gray-400">{item.Icon}</span>
                          {item.label}
                        </Link>
                      );
                    })}

                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                        <IconSignOut />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1">
                <Link href="/auth/login"
                  className="text-xs font-bold text-[#2e8b5a] hover:text-[#1a4731] border border-[#2e8b5a] px-3 py-1.5 rounded-lg transition hover:bg-[#f0faf4]">
                  Sign In
                </Link>
                <Link href="/auth/register"
                  className="text-xs font-bold text-white bg-[#2e8b5a] hover:bg-[#1a4731] px-3 py-1.5 rounded-lg transition">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation bar ─────────────────────────────────────────────── */}
        <div className="hidden md:block border-t border-gray-100 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center">

            {/* All Categories link */}
            <Link
              href="/categories"
              className="hidden md:flex items-center gap-2 px-4 py-3 text-sm font-bold transition flex-shrink-0 border-r border-gray-100 text-gray-700 hover:bg-[#f0faf4] hover:text-[#2e8b5a]"
            >
              <IconMenu />
              All Categories
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center flex-1">
              {navLinks.map(function (link) {
                return (
                  <Link key={link.label} href={link.href}
                    className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-[#2e8b5a] hover:bg-[#f0faf4] transition whitespace-nowrap">
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right quick actions */}
            <div className="hidden lg:flex items-center gap-1 ml-auto pl-4 border-l border-gray-100">
              <Link href="/escrow" className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#2e8b5a] transition px-3 py-2.5">
                <IconLock />
                Safe Escrow
              </Link>
              <Link href="/rfq" className="flex items-center gap-1.5 text-xs font-bold text-[#2e8b5a] hover:text-[#1a4731] transition px-3 py-2 bg-[#f0faf4] rounded-lg mx-1 border border-[#c8e6d4]">
                <IconPlus />
                Post RFQ
              </Link>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ────────────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            {navLinks.map(function (link) {
              return (
                <Link key={link.label} href={link.href}
                  onClick={function () { setMobileMenuOpen(false); }}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#f0faf4] hover:text-[#2e8b5a] transition">
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/settings" onClick={function () { setMobileMenuOpen(false); }}
                    className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-[#2e8b5a] border-2 border-[#2e8b5a] hover:bg-[#f0faf4] transition">
                    Profile Settings
                  </Link>
                  <button onClick={handleSignOut}
                    className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block text-center py-2.5 rounded-lg text-sm font-semibold text-[#2e8b5a] border-2 border-[#2e8b5a] hover:bg-[#f0faf4] transition">Sign In</Link>
                  <Link href="/auth/register" className="block text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2e8b5a] hover:bg-[#1a4731] transition">Register Free</Link>
                  <Link href="/auth/register?type=supplier" className="block text-center py-2.5 rounded-lg text-sm font-semibold text-[#2e8b5a] bg-[#f0faf4] hover:bg-[#e0f5ea] transition">Become a Supplier</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ══ MAIN CONTENT (bottom padding so mobile nav doesn't overlap it) ══ */}
      <main className="min-h-screen pb-16 md:pb-0">{children}</main>

      {/* ══ FOOTER — home page only ══════════════════════════════════════════ */}
      {isHome && (
        <footer className="bg-[#0f2d1c] text-white">
          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2e8b5a] to-[#1a4731] flex items-center justify-center">
                    <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                      <rect x="7" y="7" width="4.5" height="26" rx="2" fill="white" />
                      <path d="M13.5 20L27 8"  stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M13.5 20L27 33" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-black tracking-tight">Kora</div>
                    <div className="text-[10px] text-green-400 uppercase tracking-wide font-medium">B2B Marketplace</div>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-5">
                  Nigeria's trusted B2B trading platform connecting buyers and verified suppliers across all 36 states and beyond.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-[#2e8b5a]/20 text-green-300 px-3 py-1.5 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Verified Suppliers
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs bg-[#2e8b5a]/20 text-green-300 px-3 py-1.5 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Escrow Protected
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Marketplace</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: "Browse Products", href: "/marketplace" },
                    { label: "Find Suppliers",  href: "/suppliers" },
                    { label: "Post RFQ",        href: "/rfq" },
                    { label: "Trade Assurance", href: "/escrow" },
                    { label: "Categories",      href: "/categories" },
                  ].map(function (item) {
                    return (<li key={item.label}><Link href={item.href} className="text-sm text-white/60 hover:text-white transition">{item.label}</Link></li>);
                  })}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">For Suppliers</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: "Become a Supplier", href: "/auth/register?type=supplier" },
                    { label: "Seller Dashboard",  href: "/dashboard" },
                    { label: "Add Products",      href: "/add-product" },
                    { label: "Pricing Plans",     href: "/pricing" },
                    { label: "Verification",      href: "/verification" },
                  ].map(function (item) {
                    return (<li key={item.label}><Link href={item.href} className="text-sm text-white/60 hover:text-white transition">{item.label}</Link></li>);
                  })}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Company</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: "About Us",        href: "/about" },
                    { label: "Contact",         href: "/contact" },
                    { label: "Help Center",     href: "/help" },
                    { label: "Privacy Policy",  href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                  ].map(function (item) {
                    return (<li key={item.label}><Link href={item.href} className="text-sm text-white/60 hover:text-white transition">{item.label}</Link></li>);
                  })}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-white/40">© 2026 Kora Marketplace Ltd. All rights reserved.</p>
              <p className="text-xs text-white/30">Built for African Trade</p>
            </div>
          </div>
        </footer>
      )}

      {/* ══ MOBILE BOTTOM NAV (Alibaba-style) ══════════════════════════════ */}
      <MobileBottomNav user={user} msgCount={msgCount} />
    </>
  );
}