"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductById, updateProduct, uploadProductImage } from "@/lib/storage";
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

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const id = params.id;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(function() {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);

      const product = await getProductById(id);
      if (!product) {
        router.push("/seller-dashboard");
        return;
      }

      if (product.owner !== data.user.email) {
        router.push("/seller-dashboard");
        return;
      }

      setName(product.name || "");
      setPrice(product.price || "");
      setLocation(product.location || "");
      setQuantity(product.quantity || "");
      setUnit(product.unit || "");
      setCategory(product.category || "");
      setSubcategory(product.subcategory || "");
      setState(product.state || "");
      setCity(product.city || "");
      setDescription(product.description || "");
      setSellerName(product.seller || "");
      setCurrentImage(product.image || "");
      setPreview(product.image || "");

      setLoading(false);
    }
    if (id) init();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let imageUrl = currentImage;

      if (imageFile) {
        const uploaded = await uploadProductImage(imageFile);
        if (!uploaded) throw new Error("Image upload failed");
        imageUrl = uploaded;
      }

      await updateProduct(id, {
        name,
        price,
        location: city ? city + ", " + state : state || location,
        quantity,
        unit,
        category,
        subcategory,
        state,
        city,
        description,
        seller: sellerName,
        image: imageUrl,
      });

      setSuccess(true);
      setTimeout(function() {
        router.push("/seller-dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2e8b5a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0faf4]">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={function() { router.push("/seller-dashboard"); }}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2e8b5a] transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Seller Dashboard
          </button>
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2e8b5a] rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="text-base font-bold text-[#1a4731]">Kora</span>
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2e8b5a] to-[#1a4731] rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
            <p className="text-green-100 text-sm">Update your product details below.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[#f0faf4] border border-[#c8e6d4] text-[#2e8b5a] text-sm px-4 py-3 rounded-xl mb-6 font-semibold">
              Product updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name + Price */}
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

            {/* Quantity + Unit */}
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

            {/* Category + Subcategory */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Grains"
                  value={category}
                  onChange={function(e) { setCategory(e.target.value); }}
                />
              </div>
              <div>
                <label className={labelClass}>Subcategory</label>
                <input
                  className={inputClass}
                  placeholder="e.g. White Maize"
                  value={subcategory}
                  onChange={function(e) { setSubcategory(e.target.value); }}
                />
              </div>
            </div>

            {/* State + City */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>State</label>
                <select
                  className={inputClass}
                  value={state}
                  onChange={function(e) { setState(e.target.value); }}
                >
                  <option value="">Select State</option>
                  {nigerianStates.map(function(s) {
                    return <option key={s} value={s}>{s}</option>;
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

            {/* Business Name */}
            <div>
              <label className={labelClass}>Business / Seller Name</label>
              <input
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
                placeholder="Describe your product..."
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
                    if (file) setPreview(URL.createObjectURL(file));
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
                      <p className="text-sm text-gray-500">Click to change product image</p>
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

            {/* Info badge */}
            <div className="bg-[#f0faf4] border border-[#c8e6d4] rounded-xl px-4 py-3">
              <p className="text-xs text-[#2e8b5a] font-medium">
                Editing as: {user?.email}
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={function() { router.push("/seller-dashboard"); }}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-4 rounded-xl text-base font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#2e8b5a] hover:bg-[#1a4731] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl text-base font-semibold transition shadow-md"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        2025 Kora Marketplace · Empowering Nigerian Agriculture
      </div>
    </div>
  );
}