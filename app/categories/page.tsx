"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Category data (same categories used across Kora) ────────────────────────
const categories = [
  {
    name: "Agriculture & Food", slug: "agriculture-food",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22V12M8 6C8 6 7 9 9 11C9 11 11 8 14 8C14 8 13 12 10 13C10 13 13 15 16 13" /><path d="M12 12C12 12 6 10 5 4C5 4 10 4 12 8" /></svg>,
    subcategories: ["Cash Crops","Grains & Cereals","Fruits & Vegetables","Livestock & Poultry","Dairy Products","Seafood & Fishery","Spices & Herbs","Processed Food","Animal Feed","Fertilizers & Inputs","Seeds & Seedlings","Agri Machinery"],
  },
  {
    name: "Apparel & Accessories", slug: "apparel",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20.38 3.46L16 2l-4 4-4-4-4.38 1.46a1 1 0 00-.62.93V7l4 4v12h9V11l4-4V4.39a1 1 0 00-.62-.93z" /></svg>,
    subcategories: ["Men's Clothing","Women's Clothing","Children's Clothing","Traditional Wear","Footwear","Bags & Wallets","Workwear & Uniforms","Sportswear","Wedding Attire","Hats & Caps"],
  },
  {
    name: "Auto, Motorcycle & Parts", slug: "auto-motorcycle",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M5 17H3a2 2 0 01-2-2v-4l3-6h12l3 6v4a2 2 0 01-2 2h-2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>,
    subcategories: ["Car Engine Parts","Tyres & Wheels","Motorcycle Parts","Body Parts & Panels","Batteries & Electrical","Filters & Belts","Brakes & Suspension","Lubricants & Fluids","Car Care Products"],
  },
  {
    name: "Chemicals", slug: "chemicals",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 3h6v8l4 9H5l4-9V3z" /><path d="M9 12h6" /></svg>,
    subcategories: ["Industrial Chemicals","Agrochemicals","Cleaning Agents","Paint & Coatings","Adhesives & Sealants","Water Treatment","Pharmaceutical Chemicals","Detergents","Solvents"],
  },
  {
    name: "Construction & Decoration", slug: "construction",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 21h18M9 21V9l3-6 3 6v12M3 21V11l6-4M21 21V11l-6-4" /></svg>,
    subcategories: ["Cement & Concrete","Iron Rods & Steel","Roofing Materials","Tiles & Flooring","Doors & Windows","Paints & Finishes","Plumbing Materials","Electrical Fittings","Interior Decor","Granite & Marble"],
  },
  {
    name: "Consumer Electronics", slug: "electronics",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
    subcategories: ["Smartphones","Tablets","Smart TVs","Audio Systems","Cameras","Wearable Devices","Gaming Consoles","Smart Home Devices","Earphones & Headphones","Projectors"],
  },
  {
    name: "Electrical & Electronics", slug: "electrical",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    subcategories: ["Cables & Wires","Switches & Sockets","Circuit Breakers","Transformers","Generators & Inverters","Solar Panels","Electric Motors","LED Modules","Batteries","Control Panels"],
  },
  {
    name: "Furniture", slug: "furniture",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2" /><path d="M2 11a2 2 0 012-2h16a2 2 0 012 2v3H2v-3z" /><path d="M4 14v5M20 14v5M4 19h16" /></svg>,
    subcategories: ["Office Furniture","Home Furniture","School Furniture","Hospital Furniture","Sofas & Couches","Beds & Mattresses","Wardrobes & Cabinets","Tables & Chairs","Outdoor Furniture"],
  },
  {
    name: "Health & Medicine", slug: "health",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    subcategories: ["Pharmaceuticals","Medical Devices","Surgical Equipment","Diagnostic Tools","First Aid Supplies","Vitamins & Supplements","PPE","Dental Products","Lab Equipment"],
  },
  {
    name: "Industrial Equipment", slug: "industrial",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>,
    subcategories: ["Pumps & Valves","Compressors","Hydraulic Equipment","Bearings & Seals","Welding Equipment","Heat Exchangers","Filtration Systems","Safety Equipment"],
  },
  {
    name: "Lights & Lighting", slug: "lighting",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 5.5V16H8v-1.5C6.5 13.5 5 11.5 5 9a7 7 0 017-7z" /></svg>,
    subcategories: ["LED Bulbs","Solar Lights","Street Lights","Indoor Lighting","Outdoor Lighting","Floodlights","Emergency Lights","Chandeliers"],
  },
  {
    name: "Manufacturing Machinery", slug: "machinery",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" /></svg>,
    subcategories: ["Food Processing Machines","Textile Machinery","Packaging Machines","CNC Machines","Metal Fabrication","Printing Machines","Wood Processing","Moulding Equipment"],
  },
  {
    name: "Metallurgy & Energy", slug: "metallurgy",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22V12M20 17l-8 5-8-5V7l8-5 8 5v10z" /><path d="M12 12L4 7M12 12l8-5" /></svg>,
    subcategories: ["Steel & Iron","Aluminium Products","Copper & Brass","Coal & Coke","Crude Oil & Petroleum","Renewable Energy","Mining Equipment","Minerals & Ores"],
  },
  {
    name: "Packaging & Printing", slug: "packaging",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>,
    subcategories: ["Cardboard Boxes","Polythene Bags","Bubble Wrap","Labels & Stickers","Printing Services","Custom Packaging","Woven Sacks","Blister Packs"],
  },
  {
    name: "Security & Protection", slug: "security",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    subcategories: ["CCTV Cameras","Access Control","Alarm Systems","Fire Protection","Biometric Systems","Door Locks & Bolts","Perimeter Fencing","Vehicle Tracking"],
  },
  {
    name: "Textile", slug: "textile",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 3h4v18H3zM10 3h4v18h-4zM17 3h4v18h-4z" /></svg>,
    subcategories: ["Cotton Fabric","Polyester Fabric","Ankara & African Print","Lace & Embroidered Fabric","Denim Fabric","Silk & Satin","Yarn & Thread","Upholstery Fabric"],
  },
  {
    name: "Tools & Hardware", slug: "tools",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z" /></svg>,
    subcategories: ["Hand Tools","Power Tools","Cutting Tools","Measuring Tools","Fasteners & Bolts","Padlocks & Hinges","Welding Tools","Plumbing Tools"],
  },
  {
    name: "Transportation", slug: "transportation",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    subcategories: ["Trucks & Lorries","Buses & Minivans","Motorcycles & Tricycles","Agricultural Vehicles","Forklifts","Electric Vehicles","Spare Parts","Tyres & Batteries"],
  },
];

export default function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].name);

  const current = categories.find((c) => c.name === activeCategory) || categories[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-black text-[#1a4731]">Categories</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto flex" style={{ minHeight: "calc(100vh - 65px)" }}>

        {/* ── Left: category list ─────────────────────────────────────── */}
        <div className="w-[110px] sm:w-[160px] border-r border-gray-100 bg-[#f8faf8] flex-shrink-0 overflow-y-auto">
          <button
            onClick={() => setActiveCategory(categories[0].name)}
            className={`w-full text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-l-4 transition ${
              activeCategory === categories[0].name
                ? "bg-white border-[#2e8b5a] text-[#2e8b5a]"
                : "border-transparent text-gray-600 hover:bg-white"
            }`}
          >
            For You
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.name)}
              className={`w-full text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-l-4 transition leading-tight ${
                activeCategory === cat.name
                  ? "bg-white border-[#2e8b5a] text-[#2e8b5a] font-bold"
                  : "border-transparent text-gray-600 hover:bg-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Right: subcategory grid ─────────────────────────────────── */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <h2 className="text-base sm:text-xl font-black text-[#1a4731] mb-1">{current.name}</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-5">Browse subcategories</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-5">
            {current.subcategories.map((sub) => (
              <Link
                key={sub}
                href={`/?category=${encodeURIComponent(current.name)}&sub=${encodeURIComponent(sub)}`}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[#f0faf4] border border-[#e0f0e6] flex items-center justify-center mb-2 group-hover:bg-[#2e8b5a] group-hover:border-[#2e8b5a] transition text-[#2e8b5a] group-hover:text-white">
                  {current.icon}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-700 group-hover:text-[#2e8b5a] transition leading-tight">
                  {sub}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}