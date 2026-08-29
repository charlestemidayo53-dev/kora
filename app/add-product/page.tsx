"use client";

import { useEffect, useState } from "react";
import { addProduct, uploadProductImage, getParentCategories, getSubcategories } from "@/lib/storage";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const inputClass = "w-full border border-[#E5E7EB] bg-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FB923C] focus:border-transparent transition";
const labelClass = "block text-sm font-medium text-[#111827] mb-2";

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
      const normalizedPrice = price.replace(/,/g, "").trim();
      const imageUrl = await uploadProductImage(imageFile);
      
      console.log("Image URL:", imageUrl);
      if (!imageUrl) {
        throw new Error("Image upload failed. Please check your storage settings.");
      }

      await addProduct({
        name,
        price: normalizedPrice,
        location: city ? city + ", " + state : state,
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
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#111827]">Kora</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm text-[#6B7280] hover:text-[#F97316] font-medium transition">
              Dashboard
            </a>
            <a href="/marketplace" className="text-sm text-[#6B7280] hover:text-[#F97316] font-medium transition">
              Marketplace
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#111827] mb-2">List Your Product</h1>
        
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8">

          {error && (
            <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Basic Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Product Name *</label>
                  <input
                    required
                    className={inputClass}
                    placeholder=""
                    value={name}
                    onChange={function(e) { setName(e.target.value); }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price (₦) *</label>
                  <input
                    required
                    className={inputClass}
                    placeholder=""
                    value={price}
                    onChange={function(e) { setPrice(e.target.value); }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input
                    required
                    className={inputClass}
                    placeholder=""
                    value={quantity}
                    onChange={function(e) { setQuantity(e.target.value); }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit *</label>
                  <select
                    required
                    className={inputClass}
                    value={unit}
                    onChange={function(e) { setUnit(e.target.value); }}
                  >
                    <option value="">Select unit</option>
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
            </div>

            {/* Section 2: Category */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Category</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    required
                    className={inputClass}
                    value={category}
                    onChange={function(e) { handleCategoryChange(e.target.value); }}
                    disabled={loadingCats}
                  >
                    <option value="">
                      {loadingCats ? "Loading..." : "Select category"}
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
                      {subcategories.length === 0 ? "Select category first" : "Select subcategory"}
                    </option>
                    {subcategories.map(function(sub) {
                      return (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Location */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Location</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>State *</label>
                  <select
                    required
                    className={inputClass}
                    value={state}
                    onChange={function(e) { setState(e.target.value); }}
                  >
                    <option value="">Select state</option>
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
                    placeholder="Kano Municipal"
                    value={city}
                    onChange={function(e) { setCity(e.target.value); }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Business Info */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Business Information</h3>
              
              <div>
                <label className={labelClass}>Business / Seller Name *</label>
                <input
                  required
                  className={inputClass}
                  placeholder="Your business name"
                  value={sellerName}
                  onChange={function(e) { setSellerName(e.target.value); }}
                />
              </div>
            </div>

            {/* Section 5: Description */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Details</h3>
              
              <div>
                <label className={labelClass}>Product Description</label>
                <textarea
                  rows={4}
                  className={inputClass + " resize-none"}
                  placeholder="Quality, grade, processing method, delivery options, minimum order..."
                  value={description}
                  onChange={function(e) { setDescription(e.target.value); }}
                />
              </div>
            </div>

            {/* Section 6: Image */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Product Image</h3>
              
              <div className="border-2 border-dashed border-[#FED7AA] rounded-lg p-8 text-center hover:border-[#F97316] transition bg-[#FFF7ED]">
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
                      className="rounded-lg w-full max-h-64 object-cover mx-auto"
                    />
                  ) : (
                    <div>
                      <div className="w-12 h-12 bg-[#F97316] rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-[#111827] font-medium">Click to upload or drag and drop</p>
                      <p className="text-[#6B7280] text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-[#E5E7EB] pt-8 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Publishing..." : "Publish Product"}
              </button>
              <a
                href="/seller-dashboard"
                className="flex-1 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#111827] font-medium py-3 px-6 rounded-lg transition text-center border border-[#E5E7EB]"
              >
                Cancel
              </a>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
