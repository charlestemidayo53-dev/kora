"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export default function CompleteSellerProfile() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!companyName || !phone || !state || !businessAddress) {
      setError("Please fill in all four fields.");
      return;
    }

    setLoading(true);

    try {
      // Read the locally stored session first — it's already confirmed
      // and doesn't need a network round-trip, so it's more reliable
      // right after an email-confirmation redirect than getUser().
      let userId: string | undefined;

      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData?.session?.user?.id;

      if (!userId) {
        // Fall back to a live check only if there's truly no local session.
        const { data: userData } = await supabase.auth.getUser();
        userId = userData?.user?.id;
      }

      if (!userId) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          role: "seller",
          company_name: companyName,
          phone,
          state,
          business_address: businessAddress,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (upsertError) throw upsertError;

      router.push("/add-product");
    } catch (err: any) {
      setError(err.message || "Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "block text-sm font-semibold text-[#111827] mb-2";
  const inputClass = "w-full bg-white px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-[#FB923C] outline-none border border-[#E5E7EB] transition";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[480px]">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M8 6v20M8 16l10-10M8 16l10 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-[#111827] tracking-tight">Kora</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Set Up Your Supplier Account</h1>
          <p className="text-[#6B7280] mt-2">Just a few details, then you can start listing products.</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>Business / Company Name *</label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder="."
                value={companyName}
                onChange={function (e) { setCompanyName(e.target.value); }}
              />
            </div>

            <div>
              <label className={labelClass}>Contact / Phone Number *</label>
              <input
                type="tel"
                required
                className={inputClass}
                placeholder="+234 800 000 0000"
                value={phone}
                onChange={function (e) { setPhone(e.target.value); }}
              />
            </div>

            <div>
              <label className={labelClass}>Business Location (State) *</label>
              <select
                required
                className={inputClass}
                value={state}
                onChange={function (e) { setState(e.target.value); }}
              >
                <option value="">Select state</option>
                {nigerianStates.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
              </select>
            </div>

            <div>
              <label className={labelClass}>Business Address *</label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder="Street address, city"
                value={businessAddress}
                onChange={function (e) { setBusinessAddress(e.target.value); }}
              />
            </div>

            {error && (
              <div className="p-4 bg-[#FEE2E2] text-[#DC2626] text-sm font-medium rounded-lg border border-[#FECACA]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] text-white py-3.5 rounded-lg font-bold transition shadow-sm hover:shadow-md"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}