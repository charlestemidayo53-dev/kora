"use client";

import { useEffect, useState } from "react";
import { addProduct, uploadProductImage, getParentCategories, getSubcategories } from "@/lib/storage";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const inputClass = "w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2e8b5a] focus:border-transparent transition";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export default function AddProduct() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(function() {
    async function loadUser() {
      const currentUser = await getUser();
      if (!currentUser) {
        window.location.href = "/auth/login";
        return;
      }
      setUser(currentUser);
    }
    loadUser();
  }, []);

  useEffect(function() {
    async function loadProfile() {
      if (!user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("business_type, company_name")
        .eq("id", user.id)
        .single();
      if (data?.business_type) setBusinessType(data.business_type);
      if (data?.company_name) setSellerName(function(prev) { return prev || data.company_name; });
    }
    loadProfile();
  }, [user]);

  useEffect(function() {
    async function loadCategories() {
      try {
        const cats = await getParentCategories();
        setParentCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCats(false);
      }
    }
    loadCategories();
  }, []);

  async function handleCategoryChange(catName: string) {
    setCategory(catName);
    setSubcategory("");
    setSubcategories([]);

    const selected = parentCategories.find(function(c) { return c.name === catName; });
    if (selected?.id) {
      const subs = await getSubcategories(selected.id);
      setSubcategories(Array.isArray(subs) ? subs : []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!imageFile) {
      setError("Please upload a product image.");
      return;
    }

    if (!user) return;

    setLoading(true);

    try {
      const imageUrl = await uploadProductImage(imageFile);

      if (!imageUrl) {
        throw new Error("Image upload failed. Please check your storage settings.");
      }

      await addProduct({
        name,
        price,
        location: city ? city + ", " + state : state || location,
        quantity,
        unit,
        image: imageUrl,
        category,
        subcategory,
        state,
        city,
        description,
        seller: sellerName || user.email || "Unknown Seller",
        owner: user.email || "unknown",
        business_type: businessType || "Trading Company",
      });

      window.location.href = "/seller-dashboard";
    } catch (err: any) {
      console.error("Product Upload Error:", err);
      setError(err.message || "Failed to upload product. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1a4731]">Kora</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-gray-600 hover:text-[#2e8b5a] font-medium transition">
              Dashboard
            </a>
            <a href="/marketplace" className="text-sm text-gray-600 hover:text-[#2e8b5a] font-medium transition">
              Marketplace
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">List Your Product</h1>
            <p className="text-green-100 text-sm max-w-md">
              Connect directly with buyers, wholesalers, and distributors across Nigeria.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          <h2 className="text-xl font-bold text-gray-800 mb-6">Product Details</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Row 1 — Name + Price */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Product Name</label>
                <input
                  required
                  className={inputClass}
                  placeholder="e.g. Dried Maize"
                  value={name}
                  onChange={function(e) { setName(e.target.value); }}
                />
              </div>
              <div>
                <label className={labelClass}>Price (N)</label>
                <input
                  required
                  className={inputClass}
                  placeholder="e.g. 50000"
                  value={price}
                  onChange={function(e) { setPrice(e.target.value); }}
                />
              </div>
            </div>

            {/* Row 2 — Quantity + Unit */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Quantity Available</label>
                <input
                  required
                  className={inputClass}
                  placeholder="e.g. 500"
                  value={quantity}
                  onChange={function(e) { setQuantity(e.target.value); }}
                />
              </div>
              <div>
                <label className={labelClass}>Unit of Measurement</label>
                <select
                  className={inputClass}
                  value={unit}
                  onChange={function(e) { setUnit(e.target.value); }}
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tonnes">Tonnes</option>
                  <option value="bags">Bags</option>
                  <option value="litres">Litres</option>
                  <option value="units">Units</option>
                  <option value="crates">Crates</option>
                  <option value="cartons">Cartons</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>
            </div>

            {/* Row 3 — Category + Subcategory */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  required
                  className={inputClass}
                  value={category}
                  onChange={function(e) { handleCategoryChange(e.target.value); }}
                  disabled={loadingCats}
                >
                  <option value="">
                    {loadingCats ? "Loading categories..." : "Select Category"}
                  </option>
                  {parentCategories.map(function(cat) {
                    return (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className={labelClass}>Subcategory</label>
                <select
                  className={inputClass}
                  value={subcategory}
                  onChange={function(e) { setSubcategory(e.target.value); }}
                  disabled={subcategories.length === 0}
                >
                  <option value="">
                    {subcategories.length === 0 ? "Select category first" : "Select Subcategory"}
                  </option>
                  {subcategories.map(function(sub) {
                    return (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Row 4 — State + City */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>State</label>
                <select
                  required
                  className={inputClass}
                  value={state}
                  onChange={function(e) { setState(e.target.value); }}
                >
                  <option value="">Select State</option>
                  {nigerianStates.map(function(s) {
                    return (
                      <option key={s} value={s}>{s}</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className={labelClass}>City / LGA</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Kano Municipal"
                  value={city}
                  onChange={function(e) { setCity(e.target.value); }}
                />
              </div>
            </div>

            {/* Location fallback */}
            <div>
              <label className={labelClass}>Full Location Address (optional)</label>
              <input
                className={inputClass}
                placeholder="e.g. No. 5 Farm Road, Kano"
                value={location}
                onChange={function(e) { setLocation(e.target.value); }}
              />
            </div>

            {/* Business Name */}
            <div>
              <label className={labelClass}>Business / Seller Name</label>
              <input
                required
                className={inputClass}
                placeholder="e.g. Alhaji Musa Farms"
                value={sellerName}
                onChange={function(e) { setSellerName(e.target.value); }}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Product Description</label>
              <textarea
                rows={4}
                className={inputClass + " resize-none"}
                placeholder="Describe your product — quality, grade, how it was processed, delivery options, minimum order, etc."
                value={description}
                onChange={function(e) { setDescription(e.target.value); }}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className={labelClass}>Product Image</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#2e8b5a] transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={function(e) {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) {
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="rounded-xl w-full max-h-56 object-cover mx-auto"
                    />
                  ) : (
                    <div className="py-4">
                      <div className="w-12 h-12 bg-[#f0faf4] rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-[#2e8b5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Click to upload product image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
                {preview && (
                  <label htmlFor="image-upload" className="text-xs text-[#2e8b5a] mt-2 cursor-pointer hover:underline block">
                    Click to change image
                  </label>
                )}
              </div>
            </div>

            {/* Seller info badge */}
            <div className="bg-[#f0faf4] border border-[#c8e6d4] rounded-xl px-4 py-3">
              <p className="text-xs text-[#2e8b5a] font-medium">
                Listing as: {user?.email}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl text-base font-semibold transition shadow-md"
            >
              {loading ? "Uploading Product..." : "Submit Product"}
            </button>

          </form>
        </div>
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        2025 Kora Marketplace · Empowering Nigerian Agriculture
      </div>
    </div>
  );
}