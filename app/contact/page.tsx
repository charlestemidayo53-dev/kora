// ═══════════════════════════════════════════════════════════════════════════════
// 6. CONTACT PAGE - Contact form
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState } from "react";

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

const Clock = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  return (
    <div className="min-h-screen bg-[#f9fdf7]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-black mb-3">Get In Touch</h1>
          <p className="text-xl text-white/80">Have questions? We'd love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              Icon: Phone,
              title: "Phone",
              content: "+234 (0) 8140051407",
              subtext: "Mon-Fri, 9am-6pm WAT"
            },
            {
              Icon: Mail,
              title: "Email",
              content: "korasupport1@gmail.com",
              subtext: "We'll respond within 24 hours"
            },
            {
              Icon: MapPin,
              title: "Office",
              content: "Lagos, Nigeria",
              subtext: "Pan-African headquarters"
            },
          ].map((contact, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <contact.Icon className="w-12 h-12 text-[#2e8b5a] mx-auto mb-4" />
              <h3 className="text-lg font-black text-[#1a4731] mb-2">{contact.title}</h3>
              <p className="font-bold text-gray-900 mb-1">{contact.content}</p>
              <p className="text-sm text-gray-600">{contact.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-black text-[#1a4731] mb-6">Send us a message</h2>
            {success ? (
              <div className="bg-[#f0faf4] border border-[#2e8b5a] rounded-2xl p-8 text-center">
                <svg className="w-12 h-12 text-[#2e8b5a] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-black text-[#1a4731] mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-4">Thank you for reaching out. We'll get back to you soon.</p>
                <button onClick={() => setSuccess(false)} className="text-[#2e8b5a] font-bold hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 text-white py-3 rounded-lg font-black transition"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-black text-[#1a4731] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "How do I become a supplier?",
                  a: "Sign up as a supplier, complete your profile, and start listing products. We verify all suppliers to ensure quality."
                },
                {
                  q: "Are payments secure?",
                  a: "Yes! All transactions are protected by our escrow system. Payment is only released after delivery confirmation."
                },
                {
                  q: "What's your response time?",
                  a: "Our support team responds to all inquiries within 24 hours, Monday-Friday, 9am-6pm WAT."
                },
                {
                  q: "Do you ship internationally?",
                  a: "Currently, we operate within Nigeria. We're expanding to other African countries soon."
                },
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="font-bold text-gray-900 mb-2">{faq.q}</p>
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
