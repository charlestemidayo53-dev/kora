"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/lib/categories";

export default function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].name);

  const current = categories.find((c) => c.name === activeCategory) || categories[0];

  return (
    <div className="min-h-screen bg-white">

      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] px-4 py-4">
        <h1 className="text-white text-lg font-black">Shop by Category</h1>
        <p className="text-green-100 text-xs mt-0.5">Browse Kora's full product range</p>
      </div>

      <div className="flex">

        {/* Left sidebar — category list */}
        <div className="w-28 sm:w-40 shrink-0 border-r border-gray-100 bg-[#f9fdf7] max-h-[calc(100vh-64px)] overflow-y-auto">
          {categories.map((cat) => {
            const active = cat.name === activeCategory;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-full text-left px-2.5 py-3 text-[11px] sm:text-xs font-semibold leading-tight border-l-4 transition ${
                  active
                    ? "bg-white border-[#2e8b5a] text-[#2e8b5a]"
                    : "border-transparent text-gray-600 hover:bg-white hover:text-[#2e8b5a]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Right — Temu-style circular grid */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-[#1a4731]">{current.name}</h2>
            <Link
              href={`/marketplace?category=${encodeURIComponent(current.name)}`}
              className="text-xs font-bold text-[#2e8b5a] hover:text-[#1a4731]"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-2 gap-y-5">
            {current.subcategories.map((sub) => (
              <Link
                key={sub}
                href={`/marketplace?category=${encodeURIComponent(current.name)}&sub=${encodeURIComponent(sub)}`}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f0faf4] border border-[#c8e6d4] flex items-center justify-center mb-2 text-[#2e8b5a] group-hover:bg-[#2e8b5a] group-hover:text-white transition">
                  {current.icon}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-700 leading-tight line-clamp-2">
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