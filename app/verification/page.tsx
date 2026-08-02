"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SellerType = "individual" | "business";
type VerificationLevel = "unverified" | "identity" | "business" | "enterprise";

const LEVEL_LABELS: Record<VerificationLevel, string> = {
  unverified: "Unverified",
  identity: "Identity Verified",
  business: "Business Verified",
  enterprise: "Enterprise Verified",
};

const inputClass = "w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2e8b5a] focus:border-transparent transition";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function VerificationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [currentLevel, setCurrentLevel] = useState<VerificationLevel>("unverified");
  const [pendingRequest, setPendingRequest] = useState<any>(null);

  const [sellerType, setSellerType] = useState<SellerType>("individual");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [bvnNumber, setBvnNumber] = useState("");
  const [hasBusinessCert, setHasBusinessCert] = useState(false);
  const [businessCertNumber, setBusinessCertNumber] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [hasNafdac, setHasNafdac] = useState(false);
  const [nafdacNumber, setNafdacNumber] = useState("");
  const [hasSon, setHasSon] = useState(false);
  const [sonNumber, setSonNumber] = useState("");
  const [otherCertificates, setOtherCertificates] = useState("");

  const [notes, setNotes] = useState("");

  useEffect(function () {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("verification_level")
        .eq("id", data.user.id)
        .single();

      setCurrentLevel((profile?.verification_level as VerificationLevel) || "unverified");

      const { data: existing } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", data.user.id)
        .in("status", ["pending", "in_review"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setPendingRequest(existing || null);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter the full name on your ID or business documents.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number for verification.");
      return;
    }

    if (sellerType === "individual") {
      if (!ninNumber.trim()) {
        setError("Please provide your NIN.");
        return;
      }
      if (!bvnNumber.trim()) {
        setError("Please provide your BVN.");
        return;
      }
    }

    if (sellerType === "business") {
      if (!businessName.trim()) {
        setError("Please provide your business name.");
        return;
      }
      if (!cacNumber.trim()) {
        setError("Please provide your CAC registration number.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("verification_requests").insert([
        {
          user_id: user.id,
          user_email: user.email,
          seller_type: sellerType,
          requested_level: sellerType === "individual" ? "identity" : "business",
          full_name: fullName,
          phone_number: phoneNumber,
          id_number: sellerType === "individual" ? ninNumber || null : null,
          bvn_number: sellerType === "individual" ? bvnNumber || null : null,
          business_name: sellerType === "individual" ? (hasBusinessCert ? businessCertNumber || null : null) : businessName || null,
          cac_number: sellerType === "business" ? cacNumber || null : null,
          nafdac_number: sellerType === "business" && hasNafdac ? nafdacNumber || null : null,
          son_number: sellerType === "business" && hasSon ? sonNumber || null : null,
          other_certificates: sellerType === "business" ? otherCertificates || null : null,
          notes: notes || null,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit verification request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="w-10 h-10 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#2e8b5a] transition text-sm font-medium mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </button>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] p-5 sm:p-6 text-white">
            <h1 className="text-xl sm:text-2xl font-black mb-1">Account Verification</h1>
            <p className="text-green-100 text-xs sm:text-sm">
              Verified accounts get a trust badge shown on your profile and product listings.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Status</p>
            <span className={
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold " +
              (currentLevel === "unverified"
                ? "bg-gray-100 text-gray-600"
                : "bg-[#f0faf4] text-[#2e8b5a] border border-[#c8e6d4]")
            }>
              {currentLevel !== "unverified" && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {LEVEL_LABELS[currentLevel]}
            </span>

            {pendingRequest && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
                You have a verification request pending review, submitted{" "}
                {new Date(pendingRequest.created_at).toLocaleDateString()}.
              </div>
            )}
          </div>
        </div>

        {!pendingRequest && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Submit a Verification Request</h2>

            {success ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-[#f0faf4] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Request Submitted</h3>
                <p className="text-gray-500 text-sm">
                  Our team will review your documents and update your status soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Seller type selector */}
                <div>
                  <label className={labelClass}>I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSellerType("individual")}
                      className={
                        "p-3.5 rounded-xl border-2 text-left transition " +
                        (sellerType === "individual"
                          ? "border-[#2e8b5a] bg-[#f0faf4]"
                          : "border-gray-200 bg-white hover:border-gray-300")
                      }
                    >
                      <p className="font-semibold text-sm text-gray-800">Farmer / Individual</p>
                      <p className="text-xs text-gray-500 mt-0.5">Small business or individual seller</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerType("business")}
                      className={
                        "p-3.5 rounded-xl border-2 text-left transition " +
                        (sellerType === "business"
                          ? "border-[#2e8b5a] bg-[#f0faf4]"
                          : "border-gray-200 bg-white hover:border-gray-300")
                      }
                    >
                      <p className="font-semibold text-sm text-gray-800">Manufacturer / Supplier</p>
                      <p className="text-xs text-gray-500 mt-0.5">Registered company or large business</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Full Name (as on ID / documents)</label>
                  <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Musa Ibrahim" />
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input className={inputClass} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. 08012345678" />
                </div>

                {sellerType === "individual" && (
                  <>
                    <div>
                      <label className={labelClass}>NIN (National Identification Number)</label>
                      <input className={inputClass} value={ninNumber} onChange={(e) => setNinNumber(e.target.value)} placeholder="e.g. 12345678901" />
                    </div>
                    <div>
                      <label className={labelClass}>BVN (Bank Verification Number)</label>
                      <input className={inputClass} value={bvnNumber} onChange={(e) => setBvnNumber(e.target.value)} placeholder="e.g. 22345678901" />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="has-business-cert"
                        checked={hasBusinessCert}
                        onChange={(e) => setHasBusinessCert(e.target.checked)}
                        className="w-4 h-4 accent-[#2e8b5a]"
                      />
                      <label htmlFor="has-business-cert" className="text-sm text-gray-700">
                        I have a business certificate (optional)
                      </label>
                    </div>
                    {hasBusinessCert && (
                      <div>
                        <label className={labelClass}>Business Certificate Number</label>
                        <input
                          className={inputClass}
                          value={businessCertNumber}
                          onChange={(e) => setBusinessCertNumber(e.target.value)}
                          placeholder="e.g. registration or license number"
                        />
                      </div>
                    )}
                  </>
                )}

                {sellerType === "business" && (
                  <>
                    <div>
                      <label className={labelClass}>Business Name</label>
                      <input className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Alhaji Musa Farms Ltd" />
                    </div>
                    <div>
                      <label className={labelClass}>CAC Registration Number</label>
                      <input className={inputClass} value={cacNumber} onChange={(e) => setCacNumber(e.target.value)} placeholder="e.g. RC1234567" />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="has-nafdac"
                        checked={hasNafdac}
                        onChange={(e) => setHasNafdac(e.target.checked)}
                        className="w-4 h-4 accent-[#2e8b5a]"
                      />
                      <label htmlFor="has-nafdac" className="text-sm text-gray-700">
                        I have a NAFDAC certificate (where applicable)
                      </label>
                    </div>
                    {hasNafdac && (
                      <div>
                        <label className={labelClass}>NAFDAC Number</label>
                        <input className={inputClass} value={nafdacNumber} onChange={(e) => setNafdacNumber(e.target.value)} placeholder="e.g. A4-1234" />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="has-son"
                        checked={hasSon}
                        onChange={(e) => setHasSon(e.target.checked)}
                        className="w-4 h-4 accent-[#2e8b5a]"
                      />
                      <label htmlFor="has-son" className="text-sm text-gray-700">
                        I have a SON (Standards Organisation of Nigeria) certification (where applicable)
                      </label>
                    </div>
                    {hasSon && (
                      <div>
                        <label className={labelClass}>SON Certificate Number</label>
                        <input className={inputClass} value={sonNumber} onChange={(e) => setSonNumber(e.target.value)} placeholder="e.g. SON-1234" />
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Other Industry Certificates or Licences (optional)</label>
                      <textarea
                        rows={2}
                        className={inputClass + " resize-none"}
                        value={otherCertificates}
                        onChange={(e) => setOtherCertificates(e.target.value)}
                        placeholder="List any other relevant certificates or licences and their numbers"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className={labelClass}>Additional Notes (optional)</label>
                  <textarea
                    rows={3}
                    className={inputClass + " resize-none"}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything else the reviewer should know."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-md"
                >
                  {submitting ? "Submitting..." : "Submit for Review"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}