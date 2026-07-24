// ═══════════════════════════════════════════════════════════════════════════════
// 5. ABOUT PAGE - Company information
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import Link from "next/link";

const CheckCircle = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Users = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Globe = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
  </svg>
);

const Zap = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black mb-4">About Kora</h1>
          <p className="text-xl text-white/80">Africa's leading B2B marketplace connecting verified suppliers with bulk buyers</p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-16 bg-[#f9fdf7]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-[#1a4731] mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We're building the infrastructure for African trade. Kora connects verified suppliers with bulk buyers, eliminating middlemen and enabling direct, secure transactions across all 36 Nigerian states and beyond.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By combining technology, trust, and escrow-protected payments, we're making B2B trade faster, safer, and more profitable for everyone.
              </p>
            </div>
            <div className="bg-[#f0faf4] rounded-2xl p-8">
              <div className="space-y-4">
                {[
                  "Direct supplier-buyer connections",
                  "Escrow-protected payments",
                  "Verified supplier network",
                  "Pan-African reach",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#2e8b5a] flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#1a4731] text-center mb-12">By The Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Active Suppliers", value: "5,000+" },
              { label: "Monthly Trade Volume", value: "₦2.5B+" },
              { label: "States Covered", value: "36" },
              { label: "Successful Transactions", value: "50,000+" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-black text-[#2e8b5a] mb-2">{stat.value}</p>
                <p className="text-gray-600 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-[#f9fdf7]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#1a4731] text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                Icon: CheckCircle,
                title: "Trust First",
                description: "Every supplier is verified. Every transaction is protected. Your business is safe with us."
              },
              {
                Icon: Zap,
                title: "Speed Matters",
                description: "From discovery to delivery, we make B2B trading fast. Real-time quotes, instant payments."
              },
              {
                Icon: Globe,
                title: "Pan-African",
                description: "Starting in Nigeria, expanding across Africa. One platform for continental trade."
              },
            ].map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100">
                <value.Icon className="w-12 h-12 text-[#2e8b5a] mb-4" />
                <h3 className="text-xl font-black text-[#1a4731] mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">Ready to Trade Smarter?</h2>
          <p className="text-xl text-white/80 mb-8">Join thousands of suppliers and buyers already using Kora</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth" className="bg-white text-[#2e8b5a] px-8 py-3 rounded-lg font-black hover:bg-gray-100 transition">
              Get Started
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-black hover:bg-white/10 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
