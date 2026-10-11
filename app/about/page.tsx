'use client';

import Link from 'next/link';

const CheckCircle = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Globe = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M12 21a9 9 0 100-18 9 9 0 000 18z" />
  </svg>
);

const Zap = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ArrowUp = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 15l7-7 7 7M12 8v12" />
  </svg>
);

const tabs = [
  { label: 'Culture and Values', href: '#culture' },
  { label: 'Milestones', href: '#milestones' },
  { label: 'Leadership', href: '#leadership' },
  { label: 'Our Businesses', href: '#businesses' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#202124]">
      {/* Hero */}
      <section className="relative h-[430px] overflow-hidden bg-[#27313b] sm:h-[510px]">
        <img
          src="/about image.webp"
          alt="Modern office building representing Kora's growing business network"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,24,32,.74),rgba(16,24,32,.28),rgba(234,88,12,.45))]" />

        <header className="relative z-10 border-b border-white/20 bg-black/20">
          <div className="mx-auto flex h-[62px] max-w-[1100px] items-center justify-between px-5 lg:px-0">
            <Link href="/" className="text-3xl font-black tracking-[-0.08em] text-white sm:text-[34px]">
              <span className="mr-1 inline-block -skew-x-12 text-[#ff6a00]">K</span>ora
            </Link>
            <nav className="hidden items-center gap-7 text-[13px] text-white/90 lg:flex">
              <Link href="/about" className="font-semibold text-white">About Us</Link>
              <Link href="/" className="hover:text-white">Marketplace</Link>
              <Link href="/suppliers" className="hover:text-white">Suppliers</Link>
              <Link href="/buyers" className="hover:text-white">Buyers</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </nav>
            <button className="rounded border border-white/80 px-4 py-2 text-xs font-semibold text-white" aria-label="Select language">
              EN <span className="ml-4">⌄</span>
            </button>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex h-[calc(100%-62px)] max-w-[1100px] items-end px-5 pb-16 lg:px-0">
          <div className="max-w-[600px] text-white">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#ff7a18]">About Kora</p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-[52px]">
              Building the future
              <br />
              of African trade
            </h1>
            <p className="mt-5 max-w-[520px] text-base leading-7 text-white/85 sm:text-lg">
              Connecting buyers, suppliers, manufacturers and wholesalers through simpler, more transparent B2B commerce.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky-style page navigation */}
      <nav className="border-b border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,.04)]" aria-label="About sections">
        <div className="mx-auto flex max-w-[1100px] gap-7 overflow-x-auto px-5 lg:px-0">
          {tabs.map((tab, index) => (
            <a
              key={tab.label}
              href={tab.href}
              className={`whitespace-nowrap border-b-[3px] px-0 py-5 text-sm font-medium transition ${index === 0 ? 'border-[#ff6a00] font-bold text-[#202124]' : 'border-transparent text-gray-600 hover:border-[#ff6a00] hover:text-[#202124]'}`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Culture and values */}
      <section id="culture" className="bg-[#f7f7f7] py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-0">
          <SectionHeading title="Culture and Values" />
          <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <h3 className="text-xl font-medium text-[#f26b21]">Mission</h3>
              <p className="mt-5 text-[15px] leading-7 text-gray-600">To make it easy to do business anywhere across Africa and beyond.</p>
              <h3 className="mt-16 text-xl font-medium text-[#f26b21]">Vision</h3>
              <p className="mt-5 text-[15px] leading-7 text-gray-600">To become the trusted infrastructure that helps African businesses discover, connect and grow.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-[#f26b21]">Values</h3>
              <ul className="mt-5 space-y-4 text-[15px] leading-6 text-gray-600">
                <li>Customers first, partners always</li>
                <li>Trust makes every transaction simpler</li>
                <li>Technology should create opportunity</li>
                <li>Today&apos;s best performance is tomorrow&apos;s baseline</li>
                <li>Move with purpose, build for the long term</li>
                <li>Work seriously, grow together</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section id="milestones" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-0">
          <SectionHeading title="Milestones" />
          <div className="mt-8 max-w-[980px] space-y-6 text-[15px] leading-7 text-gray-600">
            <p>Kora was created to solve a simple problem: businesses should be able to find the right products and trading partners without unnecessary barriers.</p>
            <p>From our first marketplace connections to our growing supplier and buyer network, we are building practical tools that help businesses trade with greater confidence. Our platform brings discovery, communication and optional escrow protection into one clear experience.</p>
          </div>

          <div className="mt-12 grid gap-4 border-t border-gray-200 pt-8 md:grid-cols-[120px_1fr]">
            <div className="text-sm font-semibold text-[#f26b21]">Today</div>
            <div className="space-y-5 text-[15px] leading-7 text-gray-600">
              <p>Expanding supplier discovery across African markets and internationally.</p>
              <p>Helping buyers connect directly with verified businesses and trade more efficiently.</p>
              <p>Continuing to improve the infrastructure that supports transparent B2B commerce.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="bg-[#f7f7f7] py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-0">
          <SectionHeading title="Leadership" />
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Founder', 'Building tools that make trade more accessible.'],
              ['Marketplace Team', 'Connecting businesses with better opportunities.'],
              ['Operations Team', 'Making every step clearer and more dependable.'],
            ].map(([role, description]) => (
              <div key={role} className="border border-gray-200 bg-white p-7">
                <div className="mb-6 h-1 w-10 bg-[#ff6a00]" />
                <p className="text-lg font-bold text-gray-900">{role}</p>
                <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Businesses */}
      <section id="businesses" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-0">
          <SectionHeading title="Our Businesses" />
          <div className="mt-9 grid gap-2 md:grid-cols-3">
            <BusinessCard title="Kora Marketplace" icon={<Globe className="h-10 w-10 text-[#f26b21]" />} text="Discover products and connect with suppliers across African markets." />
            <BusinessCard title="Kora Trade" icon={<Zap className="h-10 w-10 text-[#f26b21]" />} text="Tools that help buyers and sellers communicate, quote and trade faster." />
            <BusinessCard title="Kora Protection" icon={<CheckCircle className="h-10 w-10 text-[#f26b21]" />} text="Optional escrow payment features that add confidence to transactions." />
          </div>
          <p className="mt-6 text-right text-xs text-gray-400">Kora — making business easier across Africa</p>
        </div>
      </section>

      <footer className="bg-[#f7f7f7] py-12">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-0">
          <div>
            <p className="text-xl font-black tracking-[-0.06em]"><span className="text-[#ff6a00]">K</span>ora</p>
            <p className="mt-2 text-sm text-gray-500">Trade smarter. Grow together.</p>
          </div>
          <div className="flex gap-5 text-sm text-gray-600">
            <Link href="/auth" className="hover:text-[#f26b21]">Get Started</Link>
            <Link href="/contact" className="hover:text-[#f26b21]">Contact Us</Link>
          </div>
        </div>
      </footer>

      <a href="#top" className="fixed bottom-7 right-7 flex h-12 w-12 items-center justify-center rounded-full bg-gray-500 text-white shadow-lg transition hover:bg-[#f26b21]" aria-label="Back to top">
        <ArrowUp />
      </a>
    </main>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#202124] sm:text-[34px]">{title}</h2>
      <div className="mt-4 h-1 w-6 bg-[#ff6a00]" />
    </div>
  );
}

function BusinessCard({ title, icon, text }: { title: string; icon: React.ReactNode; text: string }) {
  return (
    <article className="min-h-[230px] border border-gray-100 bg-[#fffaf6] p-7 transition hover:-translate-y-1 hover:shadow-md">
      {icon}
      <h3 className="mt-6 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-600">{text}</p>
    </article>
  );
}
