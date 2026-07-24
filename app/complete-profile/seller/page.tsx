// app/complete-profile/seller/page.tsx
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
  "Uganda", "Senegal", "Côte d'Ivoire", "Cameroon", "Egypt", "Morocco", "Other",
];

const steps = ["Business Info", "Products & Capacity", "Trust & Docs", "Done"];

export default function CompleteSellerProfile() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  // Step 0 — Business info
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [yearEstablished, setYearEstablished] = useState("");
  const [numEmployees, setNumEmployees] = useState("");

  // Step 1 — Products & capacity
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mainProducts, setMainProducts] = useState("");
  const [annualTurnover, setAnnualTurnover] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [exportCapable, setExportCapable] = useState("");
  const [supplyRegions, setSupplyRegions] = useState<string[]>([]);

  // Step 2 — Trust & docs
  const [certifications, setCertifications] = useState<string[]>([]);
  const [acceptedPayments, setAcceptedPayments] = useState<string[]>([]);
  const [bankVerified, setBankVerified] = useState(false);
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [howHeard, setHowHeard] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(res => setUser(res.data?.user || null));
  }, []);

  function toggleCategory(cat: string) {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }
  function toggleCert(c: string) {
    setCertifications(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function togglePayment(p: string) {
    setAcceptedPayments(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }
  function toggleRegion(r: string) {
    setSupplyRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  }

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user?.id,
        role: "seller",
        full_name: user?.user_metadata?.full_name || "",
        company_name: companyName,
        business_type: businessType,
        rc_number: rcNumber,
        country, state, city, phone, website,
        year_established: yearEstablished,
        num_employees: numEmployees,
        product_categories: selectedCategories,
        main_products: mainProducts,
        annual_turnover: annualTurnover,
        min_order_value: minOrderValue,
        export_capable: exportCapable,
        supply_regions: supplyRegions,
        certifications,
        accepted_payments: acceptedPayments,
        bank_verified: bankVerified,
        about_business: aboutBusiness,
        how_heard: howHeard,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally { setLoading(false); }
  }

  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block";
  const inputClass = "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border-none";
  const selectClass = "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border-none";

  return (
    <div className="min-h-screen bg-[#f8fcf9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[580px]">

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
          <h1 className="text-2xl font-black text-[#1a4731]">Set Up Your Supplier Profile</h1>
          <p className="text-gray-500 text-sm mt-1">A complete profile gets 5× more buyer inquiries</p>
        </div>

        {/* Progress */}
        {step < 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.slice(0, 3).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-black " +
                    (i < step ? "bg-[#2e8b5a] text-white" : i === step ? "bg-[#2e8b5a] text-white ring-4 ring-[#c8e6d4]" : "bg-gray-200 text-gray-400")}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={"text-xs font-bold hidden sm:block " + (i === step ? "text-[#2e8b5a]" : "text-gray-400")}>{s}</span>
                  {i < 2 && <div className={"h-0.5 w-8 sm:w-14 " + (i < step ? "bg-[#2e8b5a]" : "bg-gray-200")} />}
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
                <input className={inputClass} placeholder="e.g. Dangote Agro Industries Ltd." value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Business Type *</label>
                  <select className={selectClass} value={businessType} onChange={e => setBusinessType(e.target.value)}>
                    <option value="">Select…</option>
                    <option>Manufacturer</option>
                    <option>Wholesaler / Distributor</option>
                    <option>Farm / Producer</option>
                    <option>Trading Company</option>
                    <option>Processor</option>
                    <option>Cooperative</option>
                    <option>Agent / Broker</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>RC / CAC Number</label>
                  <input className={inputClass} placeholder="RC123456" value={rcNumber} onChange={e => setRcNumber(e.target.value)} />
                </div>
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
                      <option value="">Select…</option>
                      {nigerianStates.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>City / LGA</label>
                <input className={inputClass} placeholder="e.g. Apapa, Aba, Kano…" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input className={inputClass} placeholder="+234 800 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input className={inputClass} placeholder="www.yourcompany.com" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Year Established</label>
                  <input className={inputClass} placeholder="e.g. 2010" value={yearEstablished} onChange={e => setYearEstablished(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Number of Employees</label>
                  <select className={selectClass} value={numEmployees} onChange={e => setNumEmployees(e.target.value)}>
                    <option value="">Select…</option>
                    <option>1 – 10</option>
                    <option>11 – 50</option>
                    <option>51 – 200</option>
                    <option>201 – 500</option>
                    <option>500+</option>
                  </select>
                </div>
              </div>
              <button disabled={!companyName || !businessType || !phone} onClick={() => setStep(1)}
                className="w-full mt-2 bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm transition">
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 1: Products & Capacity ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-800 mb-1">Products & Supply Capacity</h2>
              <p className="text-xs text-gray-500 mb-4">Be specific — buyers search by product type</p>

              <div>
                <label className={labelClass}>Product Categories *</label>
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
              </div>

              <div>
                <label className={labelClass}>List Your Main Products *</label>
                <textarea className={inputClass + " resize-none"} rows={3}
                  placeholder="e.g. Cocoa beans (Grade 1), Palm oil (RBD), Sesame seeds…"
                  value={mainProducts} onChange={e => setMainProducts(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Annual Revenue / Turnover</label>
                  <select className={selectClass} value={annualTurnover} onChange={e => setAnnualTurnover(e.target.value)}>
                    <option value="">Select…</option>
                    <option>Under ₦10 million</option>
                    <option>₦10M – ₦50M</option>
                    <option>₦50M – ₦200M</option>
                    <option>₦200M – ₦1B</option>
                    <option>Above ₦1 billion</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Minimum Order Value</label>
                  <select className={selectClass} value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)}>
                    <option value="">Select…</option>
                    <option>No minimum</option>
                    <option>₦100,000+</option>
                    <option>₦500,000+</option>
                    <option>₦1M+</option>
                    <option>₦5M+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Can you supply to other countries?</label>
                <select className={selectClass} value={exportCapable} onChange={e => setExportCapable(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Nigeria only (domestic supply)</option>
                  <option>West Africa (ECOWAS)</option>
                  <option>Pan-Africa</option>
                  <option>Africa + Middle East</option>
                  <option>Global export</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Markets You Currently Supply</label>
                <div className="flex flex-wrap gap-2">
                  {["Lagos", "Abuja", "Port Harcourt", "Kano", "Aba", "Onitsha", "Ghana", "Benin Republic", "Cameroon", "Other Africa"].map(r => (
                    <button key={r} type="button" onClick={() => toggleRegion(r)}
                      className={"px-3 py-1.5 rounded-full border text-xs font-semibold transition " +
                        (supplyRegions.includes(r)
                          ? "border-[#2e8b5a] bg-[#f0faf4] text-[#1a4731]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 transition">← Back</button>
                <button disabled={selectedCategories.length === 0 || !mainProducts} onClick={() => setStep(2)}
                  className="flex-1 bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-black text-sm transition">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Trust & Docs ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-800 mb-1">Build Buyer Trust</h2>
              <p className="text-xs text-gray-500 mb-4">Verified suppliers receive 5× more inquiries. All fields optional but recommended.</p>

              <div>
                <label className={labelClass}>Certifications & Compliance</label>
                <div className="grid grid-cols-2 gap-2">
                  {["NAFDAC Registered", "SON Certified", "ISO 9001", "Organic Certified", "Halal Certified", "HACCP", "Export License", "CAC Registered"].map(c => (
                    <button key={c} type="button" onClick={() => toggleCert(c)}
                      className={"px-3 py-2.5 rounded-xl border text-xs font-semibold transition " +
                        (certifications.includes(c) ? "border-[#2e8b5a] bg-[#f0faf4] text-[#1a4731]" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Payment Methods You Accept</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Bank Transfer", "Escrow (Kora)", "Letter of Credit", "Cash", "Mobile Money", "USDT / Crypto"].map(p => (
                    <button key={p} type="button" onClick={() => togglePayment(p)}
                      className={"px-3 py-2.5 rounded-xl border text-xs font-semibold transition " +
                        (acceptedPayments.includes(p) ? "border-[#2e8b5a] bg-[#f0faf4] text-[#1a4731]" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>About Your Business</label>
                <textarea className={inputClass + " resize-none"} rows={3}
                  placeholder="Briefly describe what makes your business stand out, your experience, quality standards…"
                  value={aboutBusiness} onChange={e => setAboutBusiness(e.target.value)} />
              </div>

              <div className="flex items-center gap-3 bg-[#f0faf4] border border-[#c8e6d4] rounded-2xl p-4">
                <input type="checkbox" id="bankVerified" checked={bankVerified} onChange={e => setBankVerified(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2e8b5a]" />
                <label htmlFor="bankVerified" className="text-xs font-semibold text-[#1a4731] cursor-pointer">
                  I agree to bank account verification for escrow payments (recommended — increases buyer confidence)
                </label>
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
                  {loading ? "Saving…" : "Go Live as Supplier ✓"}
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
              <h2 className="text-2xl font-black text-[#1a4731] mb-2">Your Store is Live!</h2>
              <p className="text-gray-500 text-sm mb-2">Your supplier profile is now visible to buyers across Africa.</p>
              <p className="text-xs text-gray-400 mb-6">Next step: add your first product listing to start receiving inquiries.</p>
              <div className="space-y-3">
                <a href="/add-product" className="block w-full bg-[#2e8b5a] hover:bg-[#1a4731] text-white py-4 rounded-2xl font-black text-sm transition text-center">
                  Add Your First Product →
                </a>
                <a href="/seller-dashboard" className="block w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-3.5 rounded-2xl font-bold text-sm transition text-center">
                  Go to Seller Dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}