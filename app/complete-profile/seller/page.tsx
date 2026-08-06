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

  const labelClass = "block text-sm font-semibold text-[#111827] mb-2";
  const inputClass = "w-full bg-white px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-[#FB923C] outline-none border border-[#E5E7EB] transition";
  const selectClass = "w-full bg-white px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-[#FB923C] outline-none border border-[#E5E7EB] transition";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[640px]">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M8 6v20M8 16l10-10M8 16l10 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-[#111827] tracking-tight">Kora</span>
          </div>
          <h1 className="text-3xl font-bold text-[#111827]">Complete Your Supplier Profile</h1>
          <p className="text-[#6B7280] mt-2">A complete profile gets 5× more buyer inquiries</p>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div className="mb-10 px-4">
            <div className="flex items-center justify-between">
              {steps.slice(0, 3).map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10 " +
                    (i < step ? "bg-[#F97316] text-white" : i === step ? "bg-[#F97316] text-white ring-4 ring-[#FFF7ED]" : "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]")}>
                    {i < step ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={"text-xs font-semibold " + (i === step ? "text-[#F97316]" : "text-[#6B7280]")}>{s}</span>
                  {i < 2 && (
                    <div className={"absolute top-4 left-[50%] w-full h-[2px] -z-0 " + (i < step ? "bg-[#F97316]" : "bg-[#E5E7EB]")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 md:p-10">

          {/* ── STEP 0: Business Info ── */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#111827] mb-6">Business Information</h2>
              <div>
                <label className={labelClass}>Company Name *</label>
                <input className={inputClass} placeholder="e.g. Dangote Agro Industries Ltd." value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Business Type *</label>
                  <select className={selectClass} value={businessType} onChange={e => setBusinessType(e.target.value)}>
                    <option value="">Select type</option>
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
              <div className="grid grid-cols-2 gap-4">
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
                      <option value="">Select state</option>
                      {nigerianStates.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>City / LGA</label>
                <input className={inputClass} placeholder="e.g. Apapa, Aba, Kano" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input className={inputClass} placeholder="+234 800 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input className={inputClass} placeholder="www.yourcompany.com" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Year Established</label>
                  <input className={inputClass} placeholder="e.g. 2010" value={yearEstablished} onChange={e => setYearEstablished(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Number of Employees</label>
                  <select className={selectClass} value={numEmployees} onChange={e => setNumEmployees(e.target.value)}>
                    <option value="">Select range</option>
                    <option>1 – 10</option>
                    <option>11 – 50</option>
                    <option>51 – 200</option>
                    <option>201 – 500</option>
                    <option>500+</option>
                  </select>
                </div>
              </div>
              <button disabled={!companyName || !businessType || !phone} onClick={() => setStep(1)}
                className="w-full mt-4 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] text-white py-3.5 rounded-lg font-bold transition shadow-sm hover:shadow-md">
                Continue
              </button>
            </div>
          )}

          {/* ── STEP 1: Products & Capacity ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#111827]">Products & Capacity</h2>
                <p className="text-sm text-[#6B7280] mt-1">Be specific — buyers search by product type</p>
              </div>

              <div>
                <label className={labelClass}>Product Categories *</label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB]">
                  {productCategories.map(cat => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                      className={"flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold text-left transition " +
                        (selectedCategories.includes(cat)
                          ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
                          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FED7AA]")}>
                      <div className={"w-4 h-4 rounded flex items-center justify-center border " + (selectedCategories.includes(cat) ? "bg-[#F97316] border-[#F97316]" : "border-[#E5E7EB] bg-white")}>
                        {selectedCategories.includes(cat) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Main Products *</label>
                <textarea className={inputClass + " resize-none"} rows={3}
                  placeholder="e.g. Cocoa beans (Grade 1), Palm oil (RBD), Sesame seeds"
                  value={mainProducts} onChange={e => setMainProducts(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Annual Turnover</label>
                  <select className={selectClass} value={annualTurnover} onChange={e => setAnnualTurnover(e.target.value)}>
                    <option value="">Select range</option>
                    <option>Under ₦10 million</option>
                    <option>₦10M – ₦50M</option>
                    <option>₦50M – ₦200M</option>
                    <option>₦200M – ₦1B</option>
                    <option>Above ₦1 billion</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Min. Order Value</label>
                  <select className={selectClass} value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)}>
                    <option value="">Select range</option>
                    <option>No minimum</option>
                    <option>₦100,000+</option>
                    <option>₦500,000+</option>
                    <option>₦1M+</option>
                    <option>₦5M+</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(0)} className="flex-1 border border-[#E5E7EB] text-[#6B7280] py-3.5 rounded-lg font-bold text-sm hover:bg-[#F9FAFB] transition">Back</button>
                <button
                  disabled={selectedCategories.length === 0 || !mainProducts}
                  onClick={() => setStep(2)}
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] text-white py-3.5 rounded-lg font-bold text-sm transition shadow-sm hover:shadow-md">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Trust & Docs ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#111827]">Trust & Details</h2>
                <p className="text-sm text-[#6B7280] mt-1">Provide more information to build buyer trust</p>
              </div>

              <div>
                <label className={labelClass}>Accepted Payment Methods</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Bank Transfer", "Escrow (Kora)", "Letter of Credit (LC)", "Cash on Delivery", "Mobile Money", "USDT / Crypto"].map(p => (
                    <button key={p} type="button" onClick={() => togglePayment(p)}
                      className={"px-3 py-3 rounded-lg border text-xs font-semibold transition text-center " +
                        (acceptedPayments.includes(p) ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]" : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FED7AA]")}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Certifications</label>
                <div className="grid grid-cols-2 gap-2">
                  {["NAFDAC", "SON", "ISO 9001", "Organic", "Halal", "Export License"].map(c => (
                    <button key={c} type="button" onClick={() => toggleCert(c)}
                      className={"px-3 py-3 rounded-lg border text-xs font-semibold transition text-center " +
                        (certifications.includes(c) ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]" : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FED7AA]")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>About Your Business</label>
                <textarea className={inputClass + " resize-none"} rows={4}
                  placeholder="Tell buyers about your company, history, and values..."
                  value={aboutBusiness} onChange={e => setAboutBusiness(e.target.value)} />
              </div>

              {error && <p className="text-[#DC2626] text-xs font-semibold">{error}</p>}

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#E5E7EB] text-[#6B7280] py-3.5 rounded-lg font-bold text-sm hover:bg-[#F9FAFB] transition">Back</button>
                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] text-white py-3.5 rounded-lg font-bold text-sm transition shadow-sm hover:shadow-md">
                  {loading ? "Saving..." : "Finish Setup"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 3 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#111827] mb-3">Profile Complete!</h2>
              <p className="text-[#6B7280] mb-10 max-w-xs mx-auto">Your supplier profile is now live. Start adding products to reach buyers across Africa.</p>
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-4 rounded-lg font-bold transition shadow-sm hover:shadow-md">
                Go to Dashboard
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-xs text-[#6B7280] mt-10">
          © 2026 Kora Marketplace. Verified Supplier Program.
        </p>
      </div>
    </div>
  );
}
