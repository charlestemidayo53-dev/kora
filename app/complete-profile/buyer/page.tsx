// app/complete-profile/buyer/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const productCategories = [
  "Agriculture & Food", "Apparel & Accessories", "Chemicals",
  "Computer Products", "Construction & Decoration", "Consumer Electronics",
  "Electrical & Electronics", "Furniture", "Health & Medicine",
  "Industrial Equipment", "Lights & Lighting", "Machinery",
  "Metallurgy & Energy", "Office Supplies", "Packaging & Printing",
  "Raw Materials", "Security & Protection", "Sporting Goods",
  "Textile", "Tools & Hardware", "Transportation", "Wholesale",
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const africanCountries = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Ethiopia", "Tanzania",
  "Uganda", "Senegal", "Côte d'Ivoire", "Cameroon", "Egypt", "Morocco",
  "Other",
];

const steps = ["Business Info", "Sourcing Needs", "Preferences", "Done"];

export default function CompleteBuyerProfile() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  // Step 0 — Business info
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Step 1 — Sourcing needs
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [annualVolume, setAnnualVolume] = useState("");
  const [typicalOrder, setTypicalOrder] = useState("");
  const [importExperience, setImportExperience] = useState("");

  // Step 2 — Preferences
  const [preferredPayment, setPreferredPayment] = useState<string[]>([]);
  const [certRequired, setCertRequired] = useState("");
  const [howHeard, setHowHeard] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(res => setUser(res.data?.user || null));
  }, []);

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function togglePayment(p: string) {
    setPreferredPayment(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  }

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user?.id,
        role: "buyer",
        full_name: user?.user_metadata?.full_name || "",
        company_name: companyName,
        business_type: businessType,
        country,
        state,
        city,
        phone,
        website,
        sourcing_categories: selectedCategories,
        annual_volume: annualVolume,
        typical_order_value: typicalOrder,
        import_experience: importExperience,
        preferred_payment: preferredPayment,
        certification_required: certRequired,
        how_heard: howHeard,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block";
  const inputClass = "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border-none";
  const selectClass = "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border-none";

  return (
    <div className="min-h-screen bg-[#f8fcf9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[540px]">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M8 6v20M8 16l10-10M8 16l10 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-black text-[#1a4731]">Kora</span>
          </div>
          <h1 className="text-2xl font-black text-[#1a4731]">Set Up Your Buyer Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Help suppliers find and trust you faster</p>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.slice(0, 3).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-black " +
                    (i < step ? "bg-[#2e8b5a] text-white" : i === step ? "bg-[#2e8b5a] text-white ring-4 ring-[#c8e6d4]" : "bg-gray-200 text-gray-400")}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={"text-xs font-bold hidden sm:block " + (i === step ? "text-[#2e8b5a]" : "text-gray-400")}>{s}</span>
                  {i < 2 && <div className={"flex-1 h-0.5 w-8 sm:w-16 " + (i < step ? "bg-[#2e8b5a]" : "bg-gray-200")} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8">

          {/* ── STEP 0: Business Info ── */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-800 mb-4">Your Business Information</h2>
              <div>
                <label className={labelClass}>Company / Business Name *</label>
                <input className={inputClass} placeholder="e.g. Okafor Trading Ltd." value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Business Type *</label>
                <select className={selectClass} value={businessType} onChange={e => setBusinessType(e.target.value)}>
                  <option value="">Select type…</option>
                  <option>Sole Proprietor</option>
                  <option>Partnership</option>
                  <option>Limited Liability Company (LLC)</option>
                  <option>Cooperative</option>
                  <option>NGO / Non-profit</option>
                  <option>Government Agency</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Country *</label>
                  <select className={selectClass} value={country} onChange={e => setCountry(e.target.value)}>
                    {africanCountries.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {country === "Nigeria" && (
                  <div>
                    <label className={labelClass}>State *</label>
                    <select className={selectClass} value={state} onChange={e => setState(e.target.value)}>
                      <option value="">Select state…</option>
                      {nigerianStates.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>City / LGA</label>
                <input className={inputClass} placeholder="e.g. Aba, Onitsha…" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input className={inputClass} placeholder="+234 800 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Website (Optional)</label>
                  <input className={inputClass} placeholder="www.yoursite.com" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
              </div>
              <button
                disabled={!companyName || !businessType || !phone}
                onClick={() => setStep(1)}
                className="w-full mt-2 bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm transition">
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 1: Sourcing Needs ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-800 mb-1">What Do You Source?</h2>
              <p className="text-xs text-gray-500 mb-4">Select all product categories you buy or plan to buy</p>

              <div className="grid grid-cols-2 gap-2">
                {productCategories.map(cat => (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                    className={"flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold text-left transition " +
                      (selectedCategories.includes(cat)
                        ? "border-[#2e8b5a] bg-[#f0faf4] text-[#1a4731]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                    {selectedCategories.includes(cat) && (
                      <svg className="w-3 h-3 text-[#2e8b5a] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {cat}
                  </button>
                ))}
              </div>

              <div>
                <label className={labelClass}>Estimated Annual Purchase Volume</label>
                <select className={selectClass} value={annualVolume} onChange={e => setAnnualVolume(e.target.value)}>
                  <option value="">Select range…</option>
                  <option>Under ₦5 million</option>
                  <option>₦5M – ₦20M</option>
                  <option>₦20M – ₦100M</option>
                  <option>₦100M – ₦500M</option>
                  <option>Above ₦500 million</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Typical Single Order Value</label>
                <select className={selectClass} value={typicalOrder} onChange={e => setTypicalOrder(e.target.value)}>
                  <option value="">Select range…</option>
                  <option>Under ₦500,000</option>
                  <option>₦500K – ₦2M</option>
                  <option>₦2M – ₦10M</option>
                  <option>Above ₦10 million</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Import / Sourcing Experience</label>
                <select className={selectClass} value={importExperience} onChange={e => setImportExperience(e.target.value)}>
                  <option value="">Select…</option>
                  <option>First time buyer</option>
                  <option>1 – 3 years</option>
                  <option>3 – 7 years</option>
                  <option>7+ years (experienced importer)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 transition">← Back</button>
                <button
                  disabled={selectedCategories.length === 0}
                  onClick={() => setStep(2)}
                  className="flex-1 bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-black text-sm transition">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Preferences ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-800 mb-1">Preferences & Trust Signals</h2>
              <p className="text-xs text-gray-500 mb-4">This helps us surface the most relevant suppliers for you</p>

              <div>
                <label className={labelClass}>Preferred Payment Methods</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Bank Transfer", "Escrow (Kora)", "Letter of Credit (LC)", "Cash on Delivery", "Mobile Money", "USDT / Crypto"].map(p => (
                    <button key={p} type="button" onClick={() => togglePayment(p)}
                      className={"px-3 py-2.5 rounded-xl border text-xs font-semibold transition " +
                        (preferredPayment.includes(p) ? "border-[#2e8b5a] bg-[#f0faf4] text-[#1a4731]" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Do you require supplier certifications?</label>
                <select className={selectClass} value={certRequired} onChange={e => setCertRequired(e.target.value)}>
                  <option value="">Select…</option>
                  <option>No specific requirements</option>
                  <option>NAFDAC / SON Certified</option>
                  <option>ISO 9001 Quality</option>
                  <option>Organic / Natural Certified</option>
                  <option>Halal Certified</option>
                  <option>Export License Required</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>How did you hear about Kora?</label>
                <select className={selectClass} value={howHeard} onChange={e => setHowHeard(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Friend / Colleague</option>
                  <option>Google Search</option>
                  <option>Social Media</option>
                  <option>Trade Fair / Event</option>
                  <option>News / Blog</option>
                  <option>Other</option>
                </select>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 transition">← Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 text-white py-3.5 rounded-2xl font-black text-sm transition">
                  {loading ? "Saving…" : "Complete Profile ✓"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-[#f0faf4] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-[#1a4731] mb-2">You&apos;re All Set!</h2>
              <p className="text-gray-500 text-sm mb-6">Your buyer profile is live. Start browsing verified suppliers across Africa.</p>
              <div className="space-y-3">
                <a href="/marketplace" className="block w-full bg-[#2e8b5a] hover:bg-[#1a4731] text-white py-4 rounded-2xl font-black text-sm transition text-center">
                  Browse Suppliers →
                </a>
                <a href="/dashboard" className="block w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-3.5 rounded-2xl font-bold text-sm transition text-center">
                  Go to Dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}