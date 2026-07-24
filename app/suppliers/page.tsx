"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Seller = {
  owner: string;       // email — unique identifier
  seller: string;      // display name
  category: string;
  location: string;
  state: string;
  business_type: string;
  product_count: number;
};

export default function SuppliersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(function () {
    async function load() {
      setLoading(true);

      // Pull all products, then group by owner on the client
      const { data, error } = await supabase
        .from("products")
        .select("owner, seller, category, location, state, business_type");

      if (error || !data) {
        setSellers([]);
        setLoading(false);
        return;
      }

      // Group by owner email — one card per unique seller
      const map = new Map<string, Seller>();
      data.forEach(function (row) {
        const key = row.owner;
        if (!key) return;
        // Manufacturers get their own directory — skip them here
        if (row.business_type === "Manufacturer") return;
        if (map.has(key)) {
          map.get(key)!.product_count += 1;
        } else {
          map.set(key, {
            owner: row.owner,
            seller: row.seller || row.owner.split("@")[0],
            category: row.category || "",
            location: row.location || "",
            state: row.state || "",
            business_type: row.business_type || "",
            product_count: 1,
          });
        }
      });

      setSellers(Array.from(map.values()));
      setLoading(false);
    }

    load();
  }, []);

  // Unique states + categories for filter dropdowns
  const states = Array.from(new Set(sellers.map(function (s) { return s.state; }).filter(Boolean))).sort();
  const categories = Array.from(new Set(sellers.map(function (s) { return s.category; }).filter(Boolean))).sort();

  const filtered = sellers.filter(function (s) {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.seller.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q);
    const matchState = !selectedState || s.state === selectedState;
    const matchCat = !selectedCategory || s.category === selectedCategory;
    return matchSearch && matchState && matchCat;
  });

  function initials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map(function (w) { return w[0] || ""; })
      .join("")
      .toUpperCase() || "?";
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#2e8b5a] to-[#1a4731] text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-green-300 text-xs font-black uppercase tracking-widest mb-2">
            Kora Directory
          </p>
          <h1 className="text-3xl font-black mb-1">Suppliers</h1>
          <p className="text-green-200 text-sm mb-6">
            Browse traders, wholesalers, and distributors selling on Kora
          </p>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
            <input
              type="text"
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Search by name, category, or location..."
              className="flex-1 px-4 py-3 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none"
            />
            <select
              value={selectedState}
              onChange={function (e) { setSelectedState(e.target.value); }}
              className="px-4 py-3 rounded-xl text-sm text-gray-800 bg-white focus:outline-none min-w-[150px]"
            >
              <option value="">All States</option>
              {states.map(function (s) {
                return <option key={s} value={s}>{s}</option>;
              })}
            </select>
            <select
              value={selectedCategory}
              onChange={function (e) { setSelectedCategory(e.target.value); }}
              className="px-4 py-3 rounded-xl text-sm text-gray-800 bg-white focus:outline-none min-w-[170px]"
            >
              <option value="">All Categories</option>
              {categories.map(function (c) {
                return <option key={c} value={c}>{c}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Count */}
        {!loading && (
          <p className="text-sm text-gray-500 font-semibold mb-5">
            {filtered.length} seller{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-[3px] border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
          </div>

        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <p className="font-black text-gray-700 mb-1">No sellers found</p>
            <p className="text-sm text-gray-400">
              {search || selectedState || selectedCategory
                ? "Try adjusting your filters"
                : "No sellers have listed products yet"}
            </p>
          </div>

        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(function (s) {
              return (
                <div
                  key={s.owner}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#2e8b5a] transition flex flex-col"
                >
                  {/* Top */}
                  <div className="p-5 flex items-center gap-4 border-b border-gray-50">
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#2e8b5a] to-[#1a4731] text-white font-black text-lg">
                      {initials(s.seller)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-800 text-sm truncate">{s.seller}</h3>
                      {s.category && (
                        <p className="text-xs text-gray-400 mt-0.5">{s.category}</p>
                      )}
                      {s.location && (
                        <p className="text-xs text-gray-400">{s.location}{s.state ? ", " + s.state : ""}</p>
                      )}
                    </div>
                  </div>

                  {/* Listing count */}
                  <div className="px-5 py-4">
                    <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#f0faf4] text-[#2e8b5a]">
                      {s.product_count} active listing{s.product_count !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 p-5 pt-0 mt-auto">
                    <Link
                      href={"/marketplace?owner=" + encodeURIComponent(s.owner)}
                      className="text-center text-xs font-black py-2.5 rounded-xl bg-[#2e8b5a] text-white hover:bg-[#1a4731] transition"
                    >
                      View Listings
                    </Link>
                    <Link
                      href={"/message?to=" + encodeURIComponent(s.owner)}
                      className="text-center text-xs font-bold py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-[#2e8b5a] hover:text-[#2e8b5a] transition"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}