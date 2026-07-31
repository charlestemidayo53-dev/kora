"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        const t = error.message.toLowerCase();
        if (t.includes("email not confirmed") || t.includes("email_not_confirmed")) {
          await supabase.auth.resend({ type: "signup", email });
          setMessage("Email not verified. We resent the confirmation link — check your inbox.");
          setLoading(false);
          return;
        }
        throw error;
      }
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/dashboard" },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google sign in failed.");
      setGoogleLoading(false);
    }
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
            Trusted by 1,000+ businesses
          </p>
          <h2 className="text-white text-4xl font-black leading-tight mb-6">
            Africa's #1 B2B Trading Platform
          </h2>
          <div className="space-y-4">
            {[
              { title: "Escrow-protected payments", desc: "Your money is held safely until delivery is confirmed." },
              { title: "Verified suppliers only", desc: "Every supplier is screened before listing on Kora." },
              { title: "Pan-African reach", desc: "Trade across all 36 Nigerian states and beyond." },
            ].map(function (item) {
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#2e8b5a] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{item.title}</p>
                    <p className="text-[#a3cfb8] text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[#4d7a62] text-xs">© 2025 Kora Marketplace</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo removed — clean, minimal top of form on mobile */}

          <h1 className="text-3xl font-black text-[#1a4731] mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-[#2e8b5a] font-bold hover:underline">
              Create one
            </Link>
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-[#2e8b5a] text-gray-700 py-3.5 rounded-2xl font-bold text-sm transition shadow-sm mb-6"
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

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-gray-100" />
            <span className="mx-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
                className="w-full bg-gray-50 px-4 py-3.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border border-gray-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-[#2e8b5a] font-bold hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                className="w-full bg-gray-50 px-4 py-3.5 rounded-xl text-sm focus:ring-2 focus:ring-[#2e8b5a] outline-none border border-gray-200"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-50 text-[#2e8b5a] text-xs font-bold rounded-xl border border-green-100">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-sm transition shadow-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-xs text-gray-400 pt-2">
              New to Kora?{" "}
              <Link href="/auth/register" className="text-[#2e8b5a] font-bold hover:underline">
                Create a free account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}