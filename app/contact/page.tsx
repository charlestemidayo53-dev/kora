'use client';

import { useState } from "react";

/* ── Local layout helpers ── */
function PageHero(props: { image: string; alt: string; eyebrow?: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="relative w-full overflow-hidden bg-gray-900">
      <img src={props.image} alt={props.alt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      <div className="relative mx-auto flex min-h-[280px] max-w-6xl flex-col justify-center px-4 py-14 sm:min-h-[340px] md:min-h-[420px] md:px-6">
        {props.eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{props.eyebrow}</p>}
        <h1 className="max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">{props.title}</h1>
        {props.subtitle && <p className="mt-4 max-w-xl text-sm text-gray-200 sm:text-base">{props.subtitle}</p>}
        {props.children && <div className="mt-6">{props.children}</div>}
      </div>
    </section>
  );
}

function SectionTabs({ tabs }: { tabs: { id: string; label: string }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 md:gap-10 md:px-6">
        {tabs.map(function (t) {
          return (
            <a
              key={t.id}
              href={"#" + t.id}
              onClick={function () { setActive(t.id); }}
              className={"whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition " + (active === t.id ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-gray-600 hover:text-[#ea580c]")}
            >
              {t.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <h2 className="text-2xl font-black text-gray-900 md:text-3xl">{title}</h2>
      <div className="mt-3 h-[3px] w-12 bg-[#ea580c]" />
      {subtitle && <p className="mt-4 max-w-2xl text-sm text-gray-600 md:text-base">{subtitle}</p>}
    </div>
  );
}

const Phone = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const Mail = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const MapPin = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  const inputClass =
    "w-full border border-gray-300 bg-white px-4 py-3 text-sm focus:border-[#ea580c] focus:outline-none focus:ring-1 focus:ring-[#ea580c]";

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        image="/contact us.webp"
        alt="Kora customer support team ready to help"
        eyebrow="Contact Kora"
        title="We’re Here to Help"
        subtitle="Have questions about buying, selling, or using Kora? Reach out and our team will get back to you."
      />

      <SectionTabs
        tabs={[
          { id: "contact-info", label: "Contact Information" },
          { id: "message", label: "Send a Message" },
          { id: "faq", label: "FAQ" },
        ]}
      />

      {/* ── Contact info ── */}
      <section id="contact-info" className="scroll-mt-16 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title="Contact Information" subtitle="Choose the way that suits you best." />
          <div className="grid gap-px border border-gray-200 bg-gray-200 md:grid-cols-3">
            {[
              { Icon: Phone, title: "Phone", content: "+234 (0) 8140051407", subtext: "Mon-Fri, 9am-6pm WAT" },
              { Icon: Mail, title: "Email", content: "korasupport1@gmail.com", subtext: "We'll respond within 24 hours" },
              { Icon: MapPin, title: "Office", content: "Lagos, Nigeria", subtext: "Pan-African headquarters" },
            ].map((contact, i) => (
              <div key={i} className="bg-white p-6 md:p-8">
                <contact.Icon className="mb-4 h-8 w-8 text-[#ea580c]" />
                <h3 className="mb-2 text-base font-black text-gray-900">{contact.title}</h3>
                <p className="mb-1 break-words font-bold text-gray-900">{contact.content}</p>
                <p className="text-sm text-gray-600">{contact.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section id="message" className="scroll-mt-16 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title="Send Us a Message" subtitle="Fill in the form and we'll get back to you soon." />
          <div className="max-w-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            {success ? (
              <div className="border-l-4 border-[#ea580c] bg-[#fff7ed] p-8 text-center">
                <svg className="mx-auto mb-3 h-12 w-12 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="mb-2 text-lg font-black text-[#c2410c]">Message Sent!</h3>
                <p className="mb-4 text-gray-600">Thank you for reaching out. We'll get back to you soon.</p>
                <button onClick={() => setSuccess(false)} className="font-bold text-[#ea580c] hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-900">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-900">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Message</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={6} required className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ea580c] py-3 font-black text-white transition hover:bg-[#c2410c] disabled:bg-gray-200 md:w-auto md:px-10"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-16 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading title="Frequently Asked Questions" />
          <div className="grid gap-px border border-gray-200 bg-gray-200 md:grid-cols-2">
            {[
              {
                q: "How do I become a supplier?",
                a: "Sign up as a supplier, complete your profile, and start listing products. We verify all suppliers to ensure quality.",
              },
              {
                q: "Are payments secure?",
                a: "Kora does not currently offer escrow or payment protection. Online payments are processed by Flutterwave, so agree delivery terms with the supplier before you pay.",
              },
              {
                q: "What's your response time?",
                a: "Our support team responds to all inquiries within 24 hours, Monday-Friday, 9am-6pm WAT.",
              },
              {
                q: "Do you ship internationally?",
                a: "Currently, we operate within Nigeria. We're expanding to other African countries soon.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6">
                <p className="mb-2 font-bold text-gray-900">{faq.q}</p>
                <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}