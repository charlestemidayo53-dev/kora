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

type QueuedProduct = {
  name: string;
  price: string;
  quantity: string;
  unit: string;
  category: string;
  subcategory: string;
  description: string;
  imageFiles: File[];
  previews: string[];
};

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progressText, setProgressText] = useState("");

  const [queue, setQueue] = useState<QueuedProduct[]>([]);

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

  function handleImageFilesChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setImageFiles(function(prev) { return [...prev, ...newFiles]; });
    setPreviews(function(prev) { return [...prev, ...newFiles.map(function(f) { return URL.createObjectURL(f); })]; });
  }

  function removeImageAt(index: number) {
    setImageFiles(function(prev) { return prev.filter(function(_, i) { return i !== index; }); });
    setPreviews(function(prev) { return prev.filter(function(_, i) { return i !== index; }); });
  }

  function currentFormIsFilled() {
    return Boolean(name || price || quantity || category || imageFiles.length > 0);
  }

  function resetProductFields() {
    setName("");
    setPrice("");
    setQuantity("");
    setUnit("");
    setCategory("");
    setSubcategory("");
    setSubcategories([]);
    setDescription("");
    setImageFiles([]);
    setPreviews([]);
  }

  function validateCurrentProduct(): string | null {
    if (!name.trim()) return "Product name is required.";
    if (!price.trim()) return "Price is required.";
    if (!quantity.trim()) return "Quantity is required.";
    if (!unit) return "Unit is required.";
    if (!category) return "Category is required.";
    if (imageFiles.length === 0) return "Please upload at least one image.";
    return null;
  }

  function handleAddToList() {
    setError("");
    const validationError = validateCurrentProduct();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!state) {
      setError("Please select a state before adding products \u2014 it applies to every item in this batch.");
      return;
    }

    setQueue(function(prev) {
      return [...prev, { name, price, quantity, unit, category, subcategory, description, imageFiles, previews }];
    });
    resetProductFields();
  }

  function removeFromQueue(index: number) {
    setQueue(function(prev) { return prev.filter(function(_, i) { return i !== index; }); });
  }

  async function publishOne(item: QueuedProduct) {
    const normalizedPrice = item.price.replace(/,/g, "").trim();
    const imageUrls: string[] = [];
    for (const file of item.imageFiles) {
      const url = await uploadProductImage(file);
      if (!url) throw new Error("Image upload failed for \"" + item.name + "\". Please check your storage settings.");
      imageUrls.push(url);
    }

    await addProduct({
      name: item.name,
      price: normalizedPrice,
      location: city ? city + ", " + state : state,
      quantity: item.quantity,
      unit: item.unit,
      image: imageUrls[0],
      images: imageUrls,
      category: item.category,
      subcategory: item.subcategory,
      state,
      city,
      description: item.description,
      seller: sellerName || user.email || "Unknown Seller",
      owner: user.email || "unknown",
      business_type: businessType || "Trading Company",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!user) return;
    if (!state) {
      setError("Please select a state.");
      return;
    }

    const finalList: QueuedProduct[] = [...queue];

    if (currentFormIsFilled()) {
      const validationError = validateCurrentProduct();
      if (validationError) {
        setError(validationError);
        return;
      }
      finalList.push({ name, price, quantity, unit, category, subcategory, description, imageFiles, previews });
    }

    if (finalList.length === 0) {
      setError("Add at least one product before publishing.");
      return;
    }

    setLoading(true);
    try {
      for (let i = 0; i < finalList.length; i++) {
        setProgressText("Publishing " + (i + 1) + " of " + finalList.length + "...");
        await publishOne(finalList[i]);
      }
      window.location.href = "/seller-dashboard";
    } catch (err: any) {
      console.error("Product Upload Error:", err);
      setError(err.message || "Failed to upload product. Please try again.");
    } finally {
      setLoading(false);
      setProgressText("");
    }
  }

  if (!user) return null;

  const totalToPublish = queue.length + (currentFormIsFilled() ? 1 : 0);

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
          <h1 className="text-4xl font-bold text-[#111827] mb-2">List Your Products</h1>
          <p className="text-[#6B7280] text-sm">Fill in a product below, then either publish it alone or add it to a batch and list several at once.</p>
        </div>

        {/* Queue preview */}
        {queue.length > 0 && (
          <div className="bg-[#FFF7ED] border border-[#FDBA8C] rounded-xl p-5 mb-6">
            <h3 className="text-sm font-bold text-[#111827] mb-3">Products ready to publish ({queue.length})</h3>
            <div className="space-y-2">
              {queue.map(function(item, i) {
                return (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#FED7AA]">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.previews[0] && (
                        <img src={item.previews[0]} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">{item.name}</p>
                        <p className="text-xs text-[#6B7280]">₦{item.price} &middot; {item.imageFiles.length} image{item.imageFiles.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <button type="button" onClick={function() { removeFromQueue(i); }} className="text-xs text-red-500 hover:text-red-700 font-semibold flex-shrink-0 ml-3">
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                    className={inputClass}
                    placeholder=""
                    value={name}
                    onChange={function(e) { setName(e.target.value); }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price (₦) *</label>
                  <input
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
                    className={inputClass}
                    placeholder=""
                    value={quantity}
                    onChange={function(e) { setQuantity(e.target.value); }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit *</label>
                  <select
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
              <p className="text-xs text-[#6B7280] -mt-4 mb-6">Applies to every product in this batch.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>State *</label>
                  <select
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
              <p className="text-xs text-[#6B7280] -mt-4 mb-6">Applies to every product in this batch.</p>
              
              <div>
                <label className={labelClass}>Business / Seller Name *</label>
                <input
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

            {/* Section 6: Images */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-2">Product Images</h3>
              <p className="text-xs text-[#6B7280] mb-6">Minimum 1 image required. Add as many as you like.</p>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {previews.map(function(src, i) {
                    return (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5E7EB]">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={function() { removeImageAt(i); }}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 bg-[#F97316] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Cover</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-2 border-dashed border-[#FED7AA] rounded-lg p-6 text-center hover:border-[#F97316] transition bg-[#FFF7ED]">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="image-upload"
                  onChange={function(e) {
                    handleImageFilesChange(e.target.files);
                    e.target.value = "";
                  }}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-10 h-10 bg-[#F97316] rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-[#111827] font-medium text-sm">
                    {previews.length > 0 ? "Add more images" : "Click to upload images"}
                  </p>
                  <p className="text-[#6B7280] text-xs mt-1">PNG, JPG, GIF up to 10MB each</p>
                </label>
              </div>
            </div>

            {/* Add to batch */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <button
                type="button"
                onClick={handleAddToList}
                className="w-full bg-white border-2 border-[#F97316] text-[#F97316] hover:bg-[#FFF7ED] font-semibold py-3 px-6 rounded-lg transition"
              >
                + Add This Product to the List
              </button>
              <p className="text-xs text-[#6B7280] text-center mt-2">
                Use this to line up several products, then publish them all together below.
              </p>
            </div>

            {/* Submit Button */}
            <div className="border-t border-[#E5E7EB] pt-8 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (progressText || "Publishing...")
                  : totalToPublish > 1
                  ? "Publish All (" + totalToPublish + " Products)"
                  : "Publish Product"}
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
