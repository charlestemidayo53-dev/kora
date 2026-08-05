"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Role = "buyer" | "seller" | null;

export default function RegisterPage() {
  const [role, setRole] = useState<Role>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const redirectPath = role === "seller" ? "/complete-profile/seller" : "/complete-profile/buyer";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      setError("Please select Buyer or Supplier to continue.");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms and Conditions and Privacy Policy to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + redirectPath,
          data: { full_name: name, role },
        },
      });
      if (error) throw error;

      // Create the matching profiles row right away
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: name,
          role: role === "seller" ? "supplier" : "buyer",
        });
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!role) {
      setError("Please select Buyer or Supplier first.");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms and Conditions and Privacy Policy to continue.");
      return;
    }
    setGoogleLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + redirectPath },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google sign up failed.");
      setGoogleLoading(false);
    }
  }

  // ── Success screen ──
  if (done) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-10 text-center">
          <div className="w-16 h-16 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Check Your Email</h2>
          <p className="text-[#6B7280] text-sm mb-1">Verification link sent to:</p>
          <p className="font-bold text-[#F97316] mb-6">{email}</p>
          <p className="text-xs text-[#6B7280] mb-8 leading-relaxed">
            Click the link in the email to verify your account. You will then complete your{" "}
            <span className="font-bold text-[#111827]">{role === "seller" ? "Supplier" : "Buyer"} profile</span> — it takes under 2 minutes.
          </p>
          <Link
            href="/auth/login"
            className="block w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-3.5 rounded-lg font-bold text-sm transition text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#F97316] flex-col justify-between p-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
              <rect x="7" y="7" width="4.5" height="26" rx="2" fill="white" />
              <path d="M13.5 20L27 8" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M13.5 20L27 33" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">Kora</span>
        </div>

        <div>
          <h2 className="text-white text-5xl font-bold leading-[1.1] mb-8">
            Source smarter. Sell further. Trade safer.
          </h2>
          <div className="space-y-6">
            {[
              { label: "Buyers", desc: "Find verified suppliers, compare prices, order in bulk — all in one place." },
              { label: "Suppliers", desc: "List your products, reach buyers across Africa, get paid securely via escrow." },
            ].map(function (item) {
              return (
                <div key={item.label} className="bg-white/10 border border-white/20 rounded-xl p-6">
                  <p className="text-white font-bold text-xs uppercase tracking-wider mb-2">{item.label}</p>
                  <p className="text-white/80 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-white/50 text-sm">© 2026 Kora Marketplace</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[400px]">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Create your account</h1>
            <p className="text-[#6B7280]">
              Already registered?{" "}
              <Link href="/auth/login" className="text-[#F97316] font-bold hover:text-[#EA580C] transition">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-8">
            <p className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4">
              I am joining as a
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  value: "buyer" as Role,
                  label: "Buyer",
                  desc: "Source and buy",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                },
                {
                  value: "seller" as Role,
                  label: "Supplier",
                  desc: "Sell and supply",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ),
                },
              ].map(function (item) {
                const active = role === item.value;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={function () { setRole(item.value); setError(""); }}
                    className={
                      "relative flex flex-col items-start gap-4 p-4 rounded-xl border-2 transition-all text-left " +
                      (active ? "border-[#F97316] bg-[#FFF7ED]" : "border-[#E5E7EB] bg-white hover:border-[#FED7AA]")
                    }
                  >
                    <div className={"w-10 h-10 rounded-lg flex items-center justify-center " + (active ? "bg-[#F97316] text-white" : "bg-[#F9FAFB] text-[#6B7280]")}>
                      {item.icon}
                    </div>
                    <div>
                      <p className={"font-bold text-sm " + (active ? "#111827" : "text-[#111827]")}>{item.label}</p>
                      <p className="text-[11px] text-[#6B7280] leading-snug mt-1">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#E5E7EB] hover:border-[#F97316] text-[#111827] py-3.5 rounded-lg font-semibold text-sm transition shadow-sm mb-8"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-[#F97316] rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Sign up with Google
          </button>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-[#E5E7EB]" />
            <span className="mx-4 text-xs font-medium text-[#6B7280] uppercase tracking-wider">or continue with email</span>
            <div className="flex-grow border-t border-[#E5E7EB]" />
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={function (e) { setName(e.target.value); }}
                className="w-full bg-white px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-[#FB923C] outline-none border border-[#E5E7EB] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
                className="w-full bg-white px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-[#FB923C] outline-none border border-[#E5E7EB] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Create a password"
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                className="w-full bg-white px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-[#FB923C] outline-none border border-[#E5E7EB] transition"
              />
            </div>

            {/* Terms and Conditions agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={function (e) { setAgreedToTerms(e.target.checked); setError(""); }}
                className="mt-1 w-4 h-4 accent-[#F97316] rounded border-[#E5E7EB] shrink-0 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-xs text-[#6B7280] leading-relaxed cursor-pointer">
                I agree to Kora Marketplace's{" "}
                <Link href="/terms" target="_blank" className="text-[#F97316] font-bold hover:text-[#EA580C] transition">
                  Terms and Conditions
                </Link>
                ,{" "}
                <Link href="/privacy" target="_blank" className="text-[#F97316] font-bold hover:text-[#EA580C] transition">
                  Privacy Policy
                </Link>
                , and{" "}
                <Link href="/acceptable-use" target="_blank" className="text-[#F97316] font-bold hover:text-[#EA580C] transition">
                  Acceptable Use Policy
                </Link>
                .
              </label>
            </div>

            {error && (
              <div className="p-4 bg-[#FEE2E2] text-[#DC2626] text-sm font-medium rounded-lg border border-[#FECACA]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !role || !agreedToTerms}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] text-white py-3.5 rounded-lg font-bold transition shadow-sm hover:shadow-md"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-[#6B7280]">
              By signing up, you agree to our standard B2B trading terms.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
