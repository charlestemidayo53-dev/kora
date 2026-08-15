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

const inputClass = "w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition placeholder:text-gray-400";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

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
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED]">
        <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isVerified = currentLevel !== "unverified";

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F97316] transition text-sm font-medium mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#F97316] to-[#c2410c] p-6 sm:p-8 text-white">
            <h1 className="text-xl sm:text-2xl font-black mb-1">Account Verification</h1>
            <p className="text-orange-50 text-sm">Get a trust badge on your profile and listings.</p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Verified is a genuine status — this is one of the few places
                that intentionally stays green rather than orange. */}
            <span className={
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold " +
              (isVerified
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600")
            }>
              {isVerified && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {LEVEL_LABELS[currentLevel]}
            </span>

            {pendingRequest && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
                Submitted {new Date(pendingRequest.created_at).toLocaleDateString()} — pending review.
              </div>
            )}
          </div>
        </div>

        {!pendingRequest && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {success ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Request Submitted</h3>
                <p className="text-gray-500 text-sm">We'll review your documents and update your status soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg font-bold text-gray-800">Verification Request</h2>

                {/* Seller type selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSellerType("individual")}
                    className={
                      "p-4 rounded-xl border-2 text-left transition " +
                      (sellerType === "individual"
                        ? "border-[#F97316] bg-[#FFF3E8]"
                        : "border-gray-200 hover:border-gray-300")
                    }
                  >
                    <p className="font-semibold text-sm text-gray-800">Farmer / Individual</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellerType("business")}
                    className={
                      "p-4 rounded-xl border-2 text-left transition " +
                      (sellerType === "business"
                        ? "border-[#F97316] bg-[#FFF3E8]"
                        : "border-gray-200 hover:border-gray-300")
                    }
                  >
                    <p className="font-semibold text-sm text-gray-800">Manufacturer / Supplier</p>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Business Name</label>
                    <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input className={inputClass} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="08012345678" />
                  </div>
                </div>

                {sellerType === "individual" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Business name</label>
                        <input className={inputClass} value={ninNumber} onChange={(e) => setNinNumber(e.target.value)} placeholder=" " />
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <input className={inputClass} value={bvnNumber} onChange={(e) => setBvnNumber(e.target.value)} placeholder="" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="has-business-cert"
                        checked={hasBusinessCert}
                        onChange={(e) => setHasBusinessCert(e.target.checked)}
                        className="w-4 h-4 accent-[#F97316]"
                      />
                      <label htmlFor="has-business-cert" className="text-sm text-gray-700">
                        I have a business certificate (optional)
                      </label>
                    </div>
                    {hasBusinessCert && (
                      <div>
                        <label className={labelClass}>Certificate Number</label>
                        <input className={inputClass} value={businessCertNumber} onChange={(e) => setBusinessCertNumber(e.target.value)} placeholder="Registration or license number" />
                      </div>
                    )}
                  </>
                )}

                {sellerType === "business" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Business Name</label>
                        <input className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="" />
                      </div>
                      <div>
                        <label className={labelClass}>CAC Number</label>
                        <input className={inputClass} value={cacNumber} onChange={(e) => setCacNumber(e.target.value)} placeholder="RC1234567" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="has-nafdac"
                        checked={hasNafdac}
                        onChange={(e) => setHasNafdac(e.target.checked)}
                        className="w-4 h-4 accent-[#F97316]"
                      />
                      <label htmlFor="has-nafdac" className="text-sm text-gray-700">NAFDAC certificate (where applicable)</label>
                    </div>
                    {hasNafdac && (
                      <div>
                        <label className={labelClass}>NAFDAC Number</label>
                        <input className={inputClass} value={nafdacNumber} onChange={(e) => setNafdacNumber(e.target.value)} placeholder="A4-1234" />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="has-son"
                        checked={hasSon}
                        onChange={(e) => setHasSon(e.target.checked)}
                        className="w-4 h-4 accent-[#F97316]"
                      />
                      <label htmlFor="has-son" className="text-sm text-gray-700">SON certification (where applicable)</label>
                    </div>
                    {hasSon && (
                      <div>
                        <label className={labelClass}>SON Number</label>
                        <input className={inputClass} value={sonNumber} onChange={(e) => setSonNumber(e.target.value)} placeholder="SON-1234" />
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Other Certificates (optional)</label>
                      <textarea
                        rows={2}
                        className={inputClass + " resize-none"}
                        value={otherCertificates}
                        onChange={(e) => setOtherCertificates(e.target.value)}
                        placeholder="List any other certificates or licences"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className={labelClass}>Notes (optional)</label>
                  <textarea
                    rows={2}
                    className={inputClass + " resize-none"}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything else the reviewer should know"
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
                  className="w-full bg-[#F97316] hover:bg-[#c2410c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition"
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