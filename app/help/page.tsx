'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';


const faqCategories = [
  { title: 'Getting Started', items: [
    ['How do I create an account?', 'Click Register on the homepage, provide your business details, and verify your email or phone number to activate your account.'],
    ['Can I use Kora as both a buyer and a seller?', 'Yes. A single account can browse and purchase products, and can also list products for sale once seller details are added to your profile.'],
  ]},
  { title: 'Buying on Kora', items: [
    ['How do I place an order?', 'Add products to your cart from the marketplace or product detail page, then proceed to checkout to confirm quantities and delivery details with the seller.'],
    ['How do I request a quote for a large order?', 'Use the Request for Quotation (RFQ) option on the homepage or a product page to send your requirements directly to suppliers.'],
  ]},
  { title: 'Selling on Kora', items: [
    ['How do I list a product?', 'Go to your seller dashboard and select Add Product, then fill in the category, price, minimum order quantity, location, and images.'],
    ['How do I manage incoming orders?', 'Your seller dashboard shows all orders and inquiries, where you can confirm, message the buyer, or update order status.'],
  ]},
  { title: 'Payments and Disputes', items: [
    ['What payment protection is available?', "Kora does not currently offer escrow or payment protection. Online payments are processed by Flutterwave, so agree delivery terms with the supplier before you pay."],
    ['What do I do if there is a problem with an order?', 'Raise the issue through the order or messaging tools within seven days of delivery. Our team will review the details and help reach a resolution.'],
  ]},
  { title: 'Account and Security', items: [
    ['How do I update my profile or avatar?', 'Go to Profile Settings to update your business details, contact information, and profile photo.'],
    ['I suspect unauthorized access to my account. What should I do?', 'Change your password immediately and contact our support team using the details below.'],
  ]},
];

const learningCards = [
  { icon: '🛒', title: 'Buying on Kora', text: 'Source products and connect with trusted suppliers.' },
  { icon: '✓', title: 'Safe Trading', text: 'Understand escrow and payment protection.' },
  { icon: '▣', title: 'Account & Profile', text: 'Manage your account and business information.' },
  { icon: '▰', title: 'Orders & Delivery', text: 'Get help with orders, delivery, and disputes.' },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [query, setQuery] = useState('');
  const active = faqCategories.find((category) => category.title === activeCategory) ?? faqCategories[0];
  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return active.items;
    return active.items.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(term));
  }, [active, query]);

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#202124]">
      <header className="h-[68px] border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-5 lg:px-0">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-[-0.06em]">
            <span className="text-[#f97316]">K</span><span>Kora</span>
            <span className="hidden border-l border-gray-200 pl-3 text-lg font-medium tracking-normal text-gray-800 sm:inline">Help Center</span>
          </Link>
          <nav className="flex items-center gap-8 text-sm text-gray-600">
            <Link href="/" className="border-b-2 border-[#f97316] py-6 font-medium text-[#f97316]">Home</Link>
            <Link href="#faq" className="py-6 hover:text-[#f97316]">FAQ</Link>
          </nav>
        </div>
      </header>

      <section className="relative h-[310px] overflow-hidden bg-[#374151]">
        <img src="/help-center-hero.webp" alt="Kora customer support representative ready to help" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[#27313b]/55" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1200px] items-center justify-center px-5">
          <div className="w-full max-w-[550px]">
            <h1 className="mb-5 text-center text-3xl font-bold text-white sm:text-4xl">How can we help you?</h1>
            <div className="flex h-12 overflow-hidden rounded border-2 border-[#f97316] bg-white shadow-lg">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a question or keyword, e.g. payment" className="min-w-0 flex-1 px-4 text-sm outline-none" aria-label="Search help center" />
              <button type="button" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="w-14 bg-[#f97316] text-xl text-white" aria-label="Search">⌕</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-1 max-w-[1200px] px-5 py-4 lg:px-0">
        <div className="bg-white px-6 py-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Learning Center</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {learningCards.map((card) => <Link href="#faq" key={card.title} className="group text-center"><div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center text-4xl text-[#f97316] transition group-hover:scale-105">{card.icon}</div><p className="text-sm font-semibold text-gray-800">{card.title}</p><p className="mt-1 text-xs text-gray-500">{card.text}</p></Link>)}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1200px] px-5 pb-8 lg:px-0">
        <div className="mb-6 flex flex-wrap border border-gray-300 bg-white">
          {faqCategories.map((category) => <button key={category.title} onClick={() => { setActiveCategory(category.title); setQuery(''); }} className={`flex-1 border-r border-gray-300 px-4 py-4 text-sm font-medium last:border-r-0 ${activeCategory === category.title ? 'bg-[#527df2] text-white' : 'text-gray-700 hover:bg-orange-50'}`}>{category.title}</button>)}
        </div>
        <div className="bg-white px-7 py-8 shadow-sm sm:px-12">
          <div className="mb-7 flex items-center justify-between gap-4 border-b border-gray-100 pb-4"><h2 className="text-xl font-semibold">{active.title}</h2><span className="text-xs text-gray-400">{visibleItems.length} questions</span></div>
          <div className="grid gap-x-12 gap-y-7 md:grid-cols-2">
            {visibleItems.map(([question, answer]) => <details key={question} className="group"><summary className="cursor-pointer list-none text-sm font-medium text-gray-800 marker:hidden"><span className="mr-2 text-[#f97316]">•</span>{question}<span className="float-right text-[#f97316] transition group-open:rotate-45">+</span></summary><p className="mt-3 pl-4 text-sm leading-6 text-gray-600">{answer}</p></details>)}
          </div>
          {visibleItems.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No matching questions in this category.</p>}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-10 lg:px-0">
        <h2 className="mb-4 flex items-center gap-4 text-center text-xl font-semibold before:h-px before:flex-1 before:bg-gray-300 after:h-px after:flex-1 after:bg-gray-300">Contact Us</h2>
        <div className="grid bg-white shadow-sm sm:grid-cols-2">
          <Link href="mailto:korasupport1@gmail.com" className="flex items-center gap-5 border-b border-gray-100 p-8 hover:bg-orange-50 sm:border-b-0 sm:border-r"><span className="text-4xl text-[#f97316]">♧</span><span><strong className="block text-sm">Online Support</strong><small className="mt-1 block text-gray-500">korasupport1@gmail.com</small></span></Link>
          <Link href="mailto:korasupport1@gmail.com?subject=Kora%20feedback" className="flex items-center gap-5 p-8 hover:bg-orange-50"><span className="text-4xl text-[#f97316]">✎</span><span><strong className="block text-sm">Send Feedback</strong><small className="mt-1 block text-gray-500">Our team responds within 24 to 48 hours.</small></span></Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">© 2026 Kora Marketplace</footer>
    </main>
  );
}
