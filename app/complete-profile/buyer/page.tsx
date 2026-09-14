"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const quickCategories = [
  "Agriculture & Food", "Construction & Decoration", "Machinery",
  "Chemicals", "Textile", "Consumer Electronics",
  "Health & Medicine", "Transportation",
];

export default function CompleteBuyerProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      const u = data?.user || null;
      setUser(u);

      if (u) {
        // Mark the profile as set up with just the name we already have
        // from signup — nothing else is required to start using Kora.
        await supabase.from("profiles").upsert({
          id: u.id,
          role: "buyer",
          full_name: u.user_metadata?.full_name || "",
          profile_completed: true,
          updated_at: new Date().toISOString(),
        });
      }
    }
    init();
  }, []);

  function goToCategory(cat: string) {
    setSaving(true);
    router.push("/?q=" + encodeURIComponent(cat));
  }

  function goToMarketplace() {
    setSaving(true);
    router.push("/");
  }

  function goToSuppliers() {
    setSaving(true);
    router.push("/suppliers");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[560px]">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M8 6v20M8 16l10-10M8 16l10 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-[#111827] tracking-tight">Kora</span>
          </div>
          <h1 className="text-3xl font-bold text-[#111827]">You're in!</h1>
          <p className="text-[#6B7280] mt-2">What would you like to do first?</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={goToMarketplace}
            disabled={saving}
            className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-[#E5E7EB] hover:border-[#F97316] hover:bg-[#FFF7ED] transition text-left"
          >
            <div className="w-11 h-11 bg-[#FFF7ED] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#111827]">Explore the Marketplace</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Browse everything sellers currently have listed</p>
            </div>
          </button>

          <button
            onClick={goToSuppliers}
            disabled={saving}
            className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-[#E5E7EB] hover:border-[#F97316] hover:bg-[#FFF7ED] transition text-left"
          >
            <div className="w-11 h-11 bg-[#FFF7ED] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 3c0-1.657-2.686-3-6-3s-6 1.343-6 3" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#111827]">Meet Suppliers</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Browse verified suppliers on Kora</p>
            </div>
          </button>

          <div>
            <p className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3 mt-6">
              Or jump straight to a category
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => goToCategory(cat)}
                  disabled={saving}
                  className="px-4 py-3 rounded-lg border border-[#E5E7EB] hover:border-[#F97316] hover:bg-[#FFF7ED] text-xs font-semibold text-[#111827] text-left transition"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#6B7280] mt-8">
          You can add your company details anytime from Settings.
        </p>
      </div>
    </div>
  );
}
