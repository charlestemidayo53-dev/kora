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
      <div className="min-h-screen bg-[#f8fcf9] flex items-center justify-center px-6">
        <div className="w-full max-w-[400px] bg-white rounded-[2rem] shadow-xl border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-[#f0faf4] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1a4731] mb-2">Check Your Email</h2>
          <p className="text-gray-500 text-sm mb-1">Verification link sent to:</p>
          <p className="font-black text-[#2e8b5a] mb-5">{email}</p>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Click the link in the email to verify your account. You will then complete your{" "}
            <strong>{role === "seller" ? "Supplier" : "Buyer"} profile</strong> — it takes under 2 minutes.
          </p>
          <Link
            href="/auth/login"
            className="block w-full bg-[#2e8b5a] hover:bg-[#1a4731] text-white py-3.5 rounded-2xl font-black text-sm transition text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fcf9] flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1a4731] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
              <rect x="7" y="7" width="4.5" height="26" rx="2" fill="white" />
              <path d="M13.5 20L27 8" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M13.5 20L27 33" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-black text-xl">Kora</span>
        </div>

        <div>
          <p className="text-[#a3cfb8] text-sm font-semibold uppercase tracking-widest mb-4">
            Join 1,000+ businesses
          </p>
          <h2 className="text-white text-4xl font-black leading-tight mb-6">
            Source smarter. Sell further. Trade safer.
          </h2>
          <div className="space-y-4">
            {[
              { label: "Buyers", desc: "Find verified suppliers, compare prices, order in bulk — all in one place." },
              { label: "Suppliers", desc: "List your products, reach buyers across Africa, get paid securely via escrow." },
            ].map(function (item) {
              return (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[#2e8b5a] font-black text-xs uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-[#c8e6d4] text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[#4d7a62] text-xs">© 2026 Kora Marketplace</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                <rect x="7" y="7" width="4.5" height="26" rx="2" fill="white" />
                <path d="M13.5 20L27 8" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M13.5 20L27 33" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-black text-xl text-[#1a4731]">Kora</span>
          </div>

          <h1 className="text-3xl font-black text-[#1a4731] mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Already registered?{" "}
            <Link href="/auth/login" className="text-[#2e8b5a] font-bold hover:underline">
              Sign in
            </Link>
          </p>

          {/* Role selector */}
          <div className="mb-7">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              I am joining as a
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "buyer" as Role,
                  label: "Buyer",
                  desc: "I want to source and buy",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                },
                {
                  value: "seller" as Role,
                  label: "Supplier",
                  desc: "I want to sell and supply",
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
                      "relative flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left " +
                      (active ? "border-[#2e8b5a] bg-[#f0faf4]" : "border-gray-200 bg-white hover:border-gray-300")
                    }
                  >
                    {active && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[#2e8b5a] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (active ? "bg-[#2e8b5a] text-white" : "bg-gray-100 text-gray-400")}>
                      {item.icon}
                    </div>
                    <div>
                      <p className={"font-black text-sm " + (active ? "text-[#1a4731]" : "text-gray-700")}>{item.label}</p>
                      <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{item.desc}</p>
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
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-[#2e8b5a] text-gray-700 py-3.5 rounded-2xl font-bold text-sm transition shadow-sm mb-5"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-200 border-t-[#2e8b5a] rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative flex items-center mb-5">
            <div className="flex-grow border-t border-gray-100" />
            <span className="mx-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={function (e) { setName(e.target.value); }}
                className="w-full bg-gray-50 px-4 py-3.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border border-gray-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
                className="w-full bg-gray-50 px-4 py-3.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border border-gray-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Create a password"
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                className="w-full bg-gray-50 px-4 py-3.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border border-gray-200"
              />
            </div>

            {/* Terms and Conditions agreement — required before signup */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={function (e) { setAgreedToTerms(e.target.checked); setError(""); }}
                className="mt-0.5 w-4 h-4 accent-[#2e8b5a] rounded border-gray-300 shrink-0 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                I agree to Kora Marketplace's{" "}
                <Link href="/terms" target="_blank" className="text-[#2e8b5a] font-bold hover:underline">
                  Terms and Conditions
                </Link>
                ,{" "}
                <Link href="/privacy" target="_blank" className="text-[#2e8b5a] font-bold hover:underline">
                  Privacy Policy
                </Link>
                , and{" "}
                <Link href="/acceptable-use" target="_blank" className="text-[#2e8b5a] font-bold hover:underline">
                  Acceptable Use Policy
                </Link>
                .
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !role || !agreedToTerms}
              className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm transition shadow-lg"
            >
              {loading
                ? "Creating account..."
                : !role
                ? "Select Buyer or Supplier above"
                : !agreedToTerms
                ? "Agree to Terms to continue"
                : role === "buyer"
                ? "Create Buyer Account"
                : "Create Supplier Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}