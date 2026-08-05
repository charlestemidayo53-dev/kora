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
            Africa's #1 B2B Trading Platform
          </h2>
          <div className="space-y-6">
            {[
              { title: "Escrow-protected payments", desc: "Your money is held safely until delivery is confirmed." },
              { title: "Verified suppliers only", desc: "Every supplier is screened before listing on Kora." },
              { title: "Pan-African reach", desc: "Trade across all 36 Nigerian states and beyond." },
            ].map(function (item) {
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-white/70 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-white/50 text-sm">© 2026 Kora Marketplace</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-[400px]">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Welcome back</h1>
            <p className="text-[#6B7280]">
              Enter your details to access your account.
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            type="button"
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
            Sign in with Google
          </button>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-[#E5E7EB]" />
            <span className="mx-4 text-xs font-medium text-[#6B7280] uppercase tracking-wider">or continue with email</span>
            <div className="flex-grow border-t border-[#E5E7EB]" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-[#111827]">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-[#F97316] hover:text-[#EA580C] transition">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                className="w-full bg-white px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-[#FB923C] outline-none border border-[#E5E7EB] transition"
              />
            </div>

            {error && (
              <div className="p-4 bg-[#FEE2E2] text-[#DC2626] text-sm font-medium rounded-lg border border-[#FECACA]">
                {error}
              </div>
            )}
            {message && (
              <div className="p-4 bg-[#F0FDF4] text-[#16A34A] text-sm font-medium rounded-lg border border-[#BBF7D0]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-[#FED7AA] text-white py-3.5 rounded-lg font-bold transition shadow-sm hover:shadow-md"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-[#6B7280]">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-[#F97316] font-bold hover:text-[#EA580C] transition">
                Sign up for free
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
