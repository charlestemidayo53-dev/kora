// ═══════════════════════════════════════════════════════════════════════════════
// RFQ PAGE - app/rfq/page.tsx (real data from Supabase)
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

  return (
    <div className="min-h-screen bg-[#f9fdf7]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-black mb-3">Buyer Requests (RFQ)</h1>
          <p className="text-white/80 text-lg">View and respond to buyer requests for your products</p>
          <Link href="/post-rfq" className="inline-block mt-4 bg-white text-[#2e8b5a] px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition">
            Post Your Request
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
              ))}
            </select>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
            >
              {urgencies.map(urg => (
                <option key={urg} value={urg}>{urg === "all" ? "All Urgency Levels" : urg.charAt(0).toUpperCase() + urg.slice(1)}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-600 mt-4">{filteredRFQs.length} requests found</p>
        </div>

        {/* RFQ List */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-[3px] border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredRFQs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <p className="font-black text-gray-700 mb-1">No requests found</p>
            <p className="text-sm text-gray-400 mb-5">
              {filterCategory !== "all" || filterUrgency !== "all"
                ? "Try adjusting your filters"
                : "No buyers have posted a request yet"}
            </p>
            <Link href="/post-rfq" className="inline-block bg-[#2e8b5a] hover:bg-[#1a4731] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition">
              Post the First Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRFQs.map(rfq => (
              <div key={rfq.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-100 transition">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-[#1a4731]">{rfq.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(rfq.urgency)}`}>
                        {rfq.urgency.charAt(0).toUpperCase() + rfq.urgency.slice(1)} Priority
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{rfq.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Category</p>
                        <p className="font-bold text-gray-900">{rfq.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Quantity</p>
                        <p className="font-bold text-gray-900">{rfq.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Budget</p>
                        <p className="font-bold text-[#2e8b5a]">{rfq.budget}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Deadline</p>
                        <p className="font-bold text-gray-900">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Responses</p>
                      <p className="text-2xl font-black text-[#2e8b5a]">{rfq.responses || 0}</p>
                    </div>
                    <button className="bg-[#2e8b5a] hover:bg-[#1a4731] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition whitespace-nowrap">
                      View & Respond
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}