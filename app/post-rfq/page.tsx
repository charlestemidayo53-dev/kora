'use client';

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

function PageHero(props: { image: string; alt: string; eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="relative w-full overflow-hidden bg-gray-900">
      <img src={props.image} alt={props.alt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      <div className="relative mx-auto flex min-h-[280px] max-w-6xl flex-col justify-center px-4 py-14 sm:min-h-[340px] md:min-h-[420px] md:px-6">
        {props.eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">{props.eyebrow}</p>}
        <h1 className="max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">{props.title}</h1>
        {props.subtitle && <p className="mt-4 max-w-xl text-sm text-gray-200 sm:text-base">{props.subtitle}</p>}
      </div>
    </section>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-black text-gray-900 md:text-3xl">{title}</h2>
      <div className="mt-3 h-[3px] w-12 bg-[#ea580c]" />
    </div>
  );
}

const Send = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const categories = [
  "Agriculture",
  "Poultry & Livestock",
  "Seafood & Fishery",
  "Spices & Herbs",
  "Grains & Cereals",
  "Dairy Products",
  "Textiles & Fabrics",
  "Machinery & Equipment",
  "Industrial Materials",
  "Wholesale & Bulk",
];

const units = ["kg", "ton", "liter", "pieces", "boxes", "bags"];
const urgencies = ["low", "medium", "high"];

const emptyForm = {
  title: "",
  description: "",
  category: "",
  quantity: "",
  unit: "kg",
  budget: "",
  deadline: "",
  location: "",
  urgency: "medium",
};

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

export default function PostRFQPage() {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const title = formData.title.trim();
    const description = formData.description.trim();
    const location = formData.location.trim();
    const quantity = Number(formData.quantity);
    const budget = Number(formData.budget);

    if (title.length < 3 || title.length > 200) {
      setError("Title must be between 3 and 200 characters.");
      return;
    }
    if (description.length < 10 || description.length > 5000) {
      setError("Description must be between 10 and 5000 characters.");
      return;
    }
    if (!formData.category || !categories.includes(formData.category)) {
      setError("Select a category.");
      return;
    }
    if (!(quantity > 0)) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    if (!(budget > 0)) {
      setError("Enter a budget greater than zero.");
      return;
    }
    if (!formData.deadline || formData.deadline < todayISO()) {
      setError("Choose a delivery date that is today or later.");
      return;
    }
    if (location.length < 2 || location.length > 200) {
      setError("Enter a delivery location.");
      return;
    }
    if (!units.includes(formData.unit) || !urgencies.includes(formData.urgency)) {
      setError("Invalid unit or urgency.");
      return;
    }

    setLoading(true);
    try {
      const user = await getUser();
      if (!user || !user.email) {
        window.location.href = "/auth/login";
        return;
      }

      const { error: insertError } = await supabase.from("rfqs").insert({
        title,
        description,
        category: formData.category,
        quantity: quantity.toLocaleString("en-NG") + " " + formData.unit,
        budget: "N" + budget.toLocaleString("en-NG"),
        deadline: formData.deadline,
        urgency: formData.urgency,
        buyer: user.user_metadata?.full_name || user.email.split("@")[0] || "Buyer",
        buyer_email: user.email.toLowerCase(),
        location,
        status: "open",
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData(emptyForm);
    } catch (err: any) {
      console.error("RFQ post error:", err);
      setError(err.message || "Failed to post request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 bg-white px-4 py-3 text-sm focus:border-[#ea580c] focus:outline-none focus:ring-1 focus:ring-[#ea580c]";
  const labelClass = "mb-2 block text-sm font-bold text-gray-900";
  const groupClass =
    "border-b border-gray-200 pb-2 text-sm font-black uppercase tracking-wider text-[#ea580c]";

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <PageHero
          image="/rfq.webp"
          alt="Buyer submitting a request for quotation"
          eyebrow="Kora Procurement"
          title="Post Your Request"
        />
        <div className="mx-auto max-w-xl px-4 py-12 md:px-6 md:py-16">
          <div className="border border-gray-200 border-t-4 border-t-[#ea580c] bg-white p-8 text-center shadow-sm md:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-[#fff7ed]">
              <svg className="h-8 w-8 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-black text-gray-900">Request Posted</h2>
            <p className="mb-6 text-gray-600">Your request is live and suppliers can now send quotations.</p>
            <div className="space-y-3">
              <Link href="/rfq" className="block w-full bg-[#ea580c] py-3 font-bold text-white transition hover:bg-[#c2410c]">
                View All Requests
              </Link>
              <button onClick={() => setSuccess(false)} className="w-full border-2 border-[#ea580c] py-3 font-bold text-[#ea580c] transition hover:bg-[#fff7ed]">
                Post Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        image="/rfq.webp"
        alt="Buyer submitting a request for quotation"
        eyebrow="Kora Procurement"
        title="Post Your Request"
        subtitle="Tell suppliers what you need and get competitive quotes."
      />

      <section className="bg-gray-50 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-3">
          <aside className="lg:order-2">
            <SectionHeading title="How It Works" />
            <ol className="space-y-6">
              {[
                { t: "Describe what you need", d: "Add a clear title, description, and category." },
                { t: "Set quantity and budget", d: "Tell suppliers how much you need, your budget, and when." },
                { t: "Receive quotes", d: "Your request goes live and suppliers can respond." },
              ].map(function (s, i) {
                return (
                  <li key={s.t} className="flex gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[#ea580c] text-sm font-black text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{s.t}</p>
                      <p className="text-sm text-gray-600">{s.d}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>

          <div className="lg:order-1 lg:col-span-2">
            <div className="border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              {error && (
                <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-5">
                  <h3 className={groupClass}>Request Details</h3>
                  <div>
                    <label className={labelClass}>What do you need?</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Bulk Honey Purchase - 5000 kg"
                      maxLength={200}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Detailed Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide details about your requirements, quality standards, delivery preferences, etc."
                      rows={5}
                      maxLength={5000}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Product Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required className={inputClass}>
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className={groupClass}>Quantity & Budget</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        min="0"
                        step="any"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="e.g., 5000"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Unit</label>
                      <select name="unit" value={formData.unit} onChange={handleChange} className={inputClass}>
                        {units.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Total Budget (N)</label>
                    <input
                      type="number"
                      name="budget"
                      min="0"
                      step="any"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="e.g., 4250000"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className={groupClass}>Delivery</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Needed By</label>
                      <input
                        type="date"
                        name="deadline"
                        min={todayISO()}
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Delivery Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Lagos, Nigeria"
                        maxLength={200}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Urgency</label>
                    <select name="urgency" value={formData.urgency} onChange={handleChange} className={inputClass}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 bg-[#ea580c] py-4 text-lg font-black text-white transition hover:bg-[#c2410c] disabled:bg-gray-200"
                >
                  <Send className="h-5 w-5" />
                  {loading ? "Posting Request..." : "Post Request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}