"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

/* ── Local layout helpers ── */
function PageHero(props: { image: string; alt: string; eyebrow?: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="relative w-full overflow-hidden bg-gray-900">
      <img src={props.image} alt={props.alt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      <div className="relative mx-auto flex min-h-[280px] max-w-6xl flex-col justify-center px-4 py-14 sm:min-h-[340px] md:min-h-[420px] md:px-6">
        {props.eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{props.eyebrow}</p>}
        <h1 className="max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">{props.title}</h1>
        {props.subtitle && <p className="mt-4 max-w-xl text-sm text-gray-200 sm:text-base">{props.subtitle}</p>}
        {props.children && <div className="mt-6">{props.children}</div>}
      </div>
    </section>
  );
}

function SectionTabs({ tabs }: { tabs: { id: string; label: string }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 md:gap-10 md:px-6">
        {tabs.map(function (t) {
          return (
            <a
              key={t.id}
              href={"#" + t.id}
              onClick={function () { setActive(t.id); }}
              className={"whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition " + (active === t.id ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-gray-600 hover:text-[#ea580c]")}
            >
              {t.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <h2 className="text-2xl font-black text-gray-900 md:text-3xl">{title}</h2>
      <div className="mt-3 h-[3px] w-12 bg-[#ea580c]" />
      {subtitle && <p className="mt-4 max-w-2xl text-sm text-gray-600 md:text-base">{subtitle}</p>}
    </div>
  );
}

function InfoGrid({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="grid gap-px border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(function (it, i) {
        return (
          <div key={it.title} className="bg-white p-6 md:p-8">
            <p className="mb-3 text-sm font-black text-[#ea580c]">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mb-2 text-base font-black text-gray-900">{it.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{it.text}</p>
          </div>
        );
      })}
    </div>
  );
}

type Seller = {
  owner: string;       // email — unique identifier
  seller: string;      // display name
  category: string;
  location: string;
  state: string;
  business_type: string;
  product_count: number;
  profile_image: string | null;
};

export default function ManufacturersPage() {
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

      // Load profile images for the manufacturers using the existing profiles.avatar_url field
      const ownerEmails = Array.from(new Set(data
        .filter(function (row) { return row.business_type === "Manufacturer" && row.owner; })
        .map(function (row) { return row.owner; })));
      const profileMap = new Map<string, string | null>();

      if (ownerEmails.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("email, avatar_url")
          .in("email", ownerEmails);

        (profiles || []).forEach(function (profile) {
          profileMap.set(profile.email, profile.avatar_url || null);
        });
      }

      // Group by owner email — one card per unique seller
      const map = new Map<string, Seller>();
      data.forEach(function (row) {
        const key = row.owner;
        if (!key) return;
        // This directory only shows manufacturers — others belong on /suppliers
        if (row.business_type !== "Manufacturer") return;
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
            profile_image: profileMap.get(row.owner) || null,
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
    <div className="min-h-screen bg-white">
      <PageHero
        image="/manufactures.webp"
        alt="Industrial factory production floor representing Kora's manufacturers"
        eyebrow="Kora Directory"
        title="Connect With Manufacturers"
        subtitle="Find manufacturers and production partners, and buy directly from the people who make the products."
      />

      <SectionTabs
        tabs={[
          { id: "directory", label: "Manufacturer Directory" },
          { id: "capability", label: "Production Capability" },
          { id: "quality", label: "Quality" },
          { id: "connections", label: "Direct Connections" },
        ]}
      />

      {/* ── Directory ── */}
      <section id="directory" className="scroll-mt-16 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading
            title="Manufacturer Directory"
            subtitle="Browse manufacturers and producers selling directly on Kora."
          />

          {/* Search + filters */}
          <div className="mb-6 flex flex-col gap-3 border border-gray-200 bg-white p-4 md:flex-row md:p-5">
            <input
              type="text"
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Search by name, category, or location..."
              className="flex-1 border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#ea580c] focus:outline-none"
            />
            <select
              value={selectedState}
              onChange={function (e) { setSelectedState(e.target.value); }}
              className="border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#ea580c] focus:outline-none md:min-w-[160px]"
            >
              <option value="">All States</option>
              {states.map(function (s) {
                return <option key={s} value={s}>{s}</option>;
              })}
            </select>
            <select
              value={selectedCategory}
              onChange={function (e) { setSelectedCategory(e.target.value); }}
              className="border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#ea580c] focus:outline-none md:min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categories.map(function (c) {
                return <option key={c} value={c}>{c}</option>;
              })}
            </select>
          </div>

          {/* Count */}
          {!loading && (
            <p className="mb-5 text-sm font-semibold text-gray-500">
              {filtered.length} seller{filtered.length !== 1 ? "s" : ""} found
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#ea580c] border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-gray-200 bg-white py-20 text-center">
              <p className="mb-1 font-black text-gray-700">No manufacturers found</p>
              <p className="text-sm text-gray-400">
                {search || selectedState || selectedCategory
                  ? "Try adjusting your filters"
                  : "No manufacturers have listed products yet"}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(function (s) {
                return (
                  <div
                    key={s.owner}
                    className="flex flex-col border border-gray-200 bg-white shadow-sm transition hover:border-[#ea580c] hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 border-b border-gray-100 p-5">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden bg-[#ea580c] text-lg font-black text-white">
                        {s.profile_image ? (
                          <img
                            src={s.profile_image}
                            alt={s.seller + " profile"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials(s.seller)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-black text-gray-800">{s.seller}</h3>
                        {s.category && <p className="mt-0.5 text-xs text-gray-500">{s.category}</p>}
                        {s.location && (
                          <p className="text-xs text-gray-500">{s.location}{s.state ? ", " + s.state : ""}</p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <span className="inline-block border-l-2 border-[#ea580c] bg-[#fff7ed] px-3 py-1 text-xs font-black text-[#ea580c]">
                        {s.product_count} active listing{s.product_count !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 p-5 pt-0">
                      <Link
                        href={"/marketplace?owner=" + encodeURIComponent(s.owner)}
                        className="bg-[#ea580c] py-2.5 text-center text-xs font-black text-white transition hover:bg-[#c2410c]"
                      >
                        View Listings
                      </Link>
                      <Link
                        href={"/message?to=" + encodeURIComponent(s.owner)}
                        className="border border-gray-300 py-2.5 text-center text-xs font-bold text-gray-600 transition hover:border-[#ea580c] hover:text-[#ea580c]"
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
      </section>

      {/* ── Production capability ── */}
      <section id="capability" className="scroll-mt-16 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title="Production Capability" subtitle="Understand what a manufacturer can produce before you place an order." />
          <InfoGrid
            items={[
              { title: "Product categories", text: "Filter manufacturers by the categories they produce and list on Kora." },
              { title: "Location", text: "Find production partners by state to plan logistics and delivery." },
              { title: "Active listings", text: "See how many products each manufacturer currently has on the marketplace." },
            ]}
          />
        </div>
      </section>

      {/* ── Quality ── */}
      <section id="quality" className="scroll-mt-16 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title="Quality" subtitle="Confirm quality expectations before you commit." />
          <InfoGrid
            items={[
              { title: "Review the listings", text: "Open a manufacturer's listings to check product details and specifications." },
              { title: "Ask the maker", text: "Message manufacturers directly about standards, samples, and packaging." },
              { title: "Put it in writing", text: "State your quality requirements clearly in a request for quotation." },
            ]}
          />
        </div>
      </section>

      {/* ── Direct connections ── */}
      <section id="connections" className="scroll-mt-16 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title="Direct Business Connections" subtitle="Skip the middlemen and work with producers directly." />
          <InfoGrid
            items={[
              { title: "Direct messaging", text: "Contact manufacturers straight from their directory card." },
              { title: "Bulk sourcing", text: "Discuss volumes and delivery terms for larger orders." },
              { title: "Custom requests", text: "Post an RFQ and let manufacturers respond with their best offer." },
            ]}
          />
          <div className="mt-8">
            <Link href="/post-rfq" className="inline-block bg-[#ea580c] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c2410c]">
              Post a Request
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}