"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

type RFQ = {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  budget: string;
  deadline: string;
  urgency: string;
  buyer: string;
  responses: number;
};

export default function RFQPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("rfqs")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRfqs(data as RFQ[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const categories = ["all", ...Array.from(new Set(rfqs.map(function (r) { return r.category; }).filter(Boolean)))];
  const urgencies = ["all", "high", "medium", "low"];

  const filteredRFQs = rfqs.filter(function (rfq) {
    const matchesCategory = filterCategory === "all" || rfq.category === filterCategory;
    const matchesUrgency = filterUrgency === "all" || rfq.urgency === filterUrgency;
    return matchesCategory && matchesUrgency;
  });

  const getUrgencyColor = (urgency: string) => {
    if (urgency === "high") return "bg-red-100 text-red-700 border-red-300";
    if (urgency === "medium") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-green-100 text-green-700 border-green-300";
  };

  const selectClass =
    "border border-gray-300 bg-white px-4 py-3 text-sm focus:border-[#ea580c] focus:outline-none focus:ring-1 focus:ring-[#ea580c]";

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        image="/save.webp"
        alt="Procurement professional reviewing quotations and documents"
        eyebrow="Kora Procurement"
        title="Request for Quotation"
        subtitle="View and respond to buyer requests for your products."
      >
        <Link
          href="/post-rfq"
          className="inline-block bg-[#ea580c] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c2410c]"
        >
          Post Your Request
        </Link>
      </PageHero>

      <SectionTabs
        tabs={[
          { id: "requests", label: "Open Requests" },
          { id: "how-it-works", label: "How It Works" },
        ]}
      />

      {/* ── Requests ── */}
      <section id="requests" className="scroll-mt-16 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title="Open Requests" subtitle="Buyer requests waiting for supplier quotes." />

          {/* Filters */}
          <div className="mb-8 border border-gray-200 bg-white p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={selectClass}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
                ))}
              </select>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className={selectClass}
              >
                {urgencies.map(urg => (
                  <option key={urg} value={urg}>{urg === "all" ? "All Urgency Levels" : urg.charAt(0).toUpperCase() + urg.slice(1)}</option>
                ))}
              </select>
            </div>
            <p className="mt-4 text-sm text-gray-600">{filteredRFQs.length} requests found</p>
          </div>

          {/* RFQ List */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#ea580c] border-t-transparent" />
            </div>
          ) : filteredRFQs.length === 0 ? (
            <div className="border border-gray-200 bg-white py-20 text-center">
              <p className="mb-1 font-black text-gray-700">No requests found</p>
              <p className="mb-5 text-sm text-gray-400">
                {filterCategory !== "all" || filterUrgency !== "all"
                  ? "Try adjusting your filters"
                  : "No buyers have posted a request yet"}
              </p>
              <Link href="/post-rfq" className="inline-block bg-[#ea580c] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#c2410c]">
                Post the First Request
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRFQs.map(rfq => (
                <div key={rfq.id} className="border border-gray-200 border-l-4 border-l-[#ea580c] bg-white p-5 shadow-sm transition hover:shadow-md md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-black text-gray-900 md:text-xl">{rfq.title}</h3>
                        <span className={`border px-3 py-1 text-xs font-bold ${getUrgencyColor(rfq.urgency)}`}>
                          {rfq.urgency.charAt(0).toUpperCase() + rfq.urgency.slice(1)} Priority
                        </span>
                      </div>
                      <p className="mb-4 text-gray-600">{rfq.description}</p>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Category</p>
                          <p className="font-bold text-gray-900">{rfq.category}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Quantity</p>
                          <p className="font-bold text-gray-900">{rfq.quantity}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Budget</p>
                          <p className="font-bold text-[#ea580c]">{rfq.budget}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Deadline</p>
                          <p className="font-bold text-gray-900">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4 md:flex-col md:items-end md:border-0 md:pt-0">
                      <div className="md:text-right">
                        <p className="mb-1 text-xs text-gray-500">Responses</p>
                        <p className="text-2xl font-black text-[#ea580c]">{rfq.responses || 0}</p>
                      </div>
                      <Link href={"/rfq/" + rfq.id} className="whitespace-nowrap bg-[#ea580c] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#c2410c]">View & Respond</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="scroll-mt-16 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title="How It Works" subtitle="A simple quotation workflow for buyers and suppliers." />
          <InfoGrid
            items={[
              { title: "Buyer posts a request", text: "Describe the product, quantity, budget, and delivery needs." },
              { title: "Suppliers respond", text: "Suppliers review open requests and send their quotes." },
              { title: "Compare and decide", text: "Review the responses and choose the offer that fits your business." },
            ]}
          />
        </div>
      </section>
    </div>
  );
}