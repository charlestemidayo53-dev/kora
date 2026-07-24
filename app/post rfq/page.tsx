// ═══════════════════════════════════════════════════════════════════════════════
// POST RFQ PAGE - Form for buyers to post requests (saved to Supabase)
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

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

export default function PostRFQPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    unit: "kg",
    budget: "",
    deadline: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await getUser();
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const { error: insertError } = await supabase.from("rfqs").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantity: formData.quantity + " " + formData.unit,
        budget: "₦" + Number(formData.budget).toLocaleString(),
        deadline: formData.deadline,
        urgency: "medium",
        buyer: user.user_metadata?.full_name || user.email?.split("@")[0] || "Buyer",
        buyer_email: user.email,
        location: formData.location,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        category: "",
        quantity: "",
        unit: "kg",
        budget: "",
        deadline: "",
        location: "",
      });
    } catch (err: any) {
      console.error("RFQ post error:", err);
      setError(err.message || "Failed to post request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f9fdf7] flex items-center justify-center px-6">
        <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-[#f0faf4] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1a4731] mb-2">Request Posted Successfully!</h2>
          <p className="text-gray-600 mb-6">Your RFQ is now live and suppliers can start responding.</p>
          <div className="space-y-3">
            <Link href="/rfq" className="block w-full bg-[#2e8b5a] hover:bg-[#1a4731] text-white py-3 rounded-lg font-bold transition">
              View All Requests
            </Link>
            <button onClick={() => setSuccess(false)} className="w-full border-2 border-[#2e8b5a] text-[#2e8b5a] hover:bg-[#f0faf4] py-3 rounded-lg font-bold transition">
              Post Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fdf7]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] text-white py-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-black mb-3">Post a Request for Quote</h1>
          <p className="text-white/80 text-lg">Tell suppliers what you need and get competitive quotes</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">What do you need?</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Bulk Honey Purchase - 5000 kg"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Detailed Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about your requirements, quality standards, delivery preferences, etc."
                rows={5}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Product Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 5000"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ton">Ton</option>
                  <option value="liter">Liter</option>
                  <option value="pieces">Pieces</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Budget (₦)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., 4250000"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Needed By</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Delivery Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Lagos, Nigeria"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e8b5a]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-200 text-white py-4 rounded-lg font-black text-lg transition flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {loading ? "Posting Request..." : "Post Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}