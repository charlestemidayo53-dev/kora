"use client";

import { useEffect, useRef, useState } from "react";
import { uploadProductImage, getParentCategories, getSubcategories } from "@/lib/storage";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const inputClass = "w-full border border-[#E5E7EB] bg-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FB923C] focus:border-transparent transition";
const labelClass = "block text-sm font-medium text-[#111827] mb-2";

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_BATCH = 20;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const UNITS: [string, string][] = [
  ["kg", "Kilograms (kg)"],
  ["tonnes", "Tonnes"],
  ["bags", "Bags"],
  ["litres", "Litres"],
  ["units", "Units"],
  ["crates", "Crates"],
  ["cartons", "Cartons"],
  ["pieces", "Pieces"],
];

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
  minimumOrder: string;
  unit: string;
  category: string;
  subcategory: string;
  description: string;
  imageFiles: File[];
  previews: string[];
};

function cleanNumber(value: string) {
  return value.replace(/,/g, "").trim();
}

function isPositiveNumber(value: string) {
  return /^\d+(\.\d+)?$/.test(value) && Number(value) > 0;
}

export default function AddProduct() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [profileCompany, setProfileCompany] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progressText, setProgressText] = useState("");

  const [queue, setQueue] = useState<QueuedProduct[]>([]);
  const uploadedRef = useRef<Map<QueuedProduct, string[]>>(new Map());

  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(function () {
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

  useEffect(function () {
    async function loadProfile() {
      if (!user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", user.id)
        .maybeSingle();
      const company = data?.company_name ? String(data.company_name).trim() : "";
      if (company) {
        setProfileCompany(company);
        setSellerName(company);
      }
    }
    loadProfile();
  }, [user]);

  useEffect(function () {
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

    const selected = parentCategories.find(function (c) { return c.id === catName; });
    if (selected?.id) {
      const subs = await getSubcategories(selected.id);
      setSubcategories(Array.isArray(subs) ? subs : []);
    }
  }

  function handleImageFilesChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    const accepted: File[] = [];
    let rejected = "";

    Array.from(files).forEach(function (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        rejected = file.name + " is not a supported image. Use JPG, PNG, WEBP or GIF.";
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        rejected = file.name + " is larger than 10MB.";
        return;
      }
      accepted.push(file);
    });

    const room = Math.max(MAX_IMAGES - imageFiles.length, 0);
    const toAdd = accepted.slice(0, room);
    if (accepted.length > toAdd.length) {
      rejected = "You can add up to " + MAX_IMAGES + " images per product.";
    }
    if (rejected) setError(rejected);
    if (toAdd.length === 0) return;

    setImageFiles(function (prev) { return [...prev, ...toAdd]; });
    setPreviews(function (prev) {
      return [...prev, ...toAdd.map(function (f) { return URL.createObjectURL(f); })];
    });
  }

  function removeImageAt(index: number) {
    const url = previews[index];
    if (url) URL.revokeObjectURL(url);
    setImageFiles(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    setPreviews(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
  }

  function currentFormIsFilled() {
    return Boolean(name || price || quantity || category || imageFiles.length > 0);
  }

  function resetProductFields() {
    setName("");
    setPrice("");
    setQuantity("");
    setMinimumOrder("");
    setUnit("");
    setCategory("");
    setSubcategory("");
    setSubcategories([]);
    setDescription("");
    setImageFiles([]);
    setPreviews([]);
  }

  function validateCurrentProduct(): string | null {
    if (name.trim().length < 3) return "Product name must be at least 3 characters.";
    if (!isPositiveNumber(cleanNumber(price))) return "Enter a valid price above zero.";
    if (!isPositiveNumber(cleanNumber(quantity))) return "Enter a valid quantity above zero.";
    if (minimumOrder.trim()) {
      const moq = cleanNumber(minimumOrder);
      if (!isPositiveNumber(moq)) return "Minimum order must be a number above zero.";
      if (Number(moq) > Number(cleanNumber(quantity))) return "Minimum order cannot be more than the quantity available.";
    }
    if (!unit) return "Unit is required.";
    if (!category) return "Category is required.";
    if (imageFiles.length === 0) return "Please upload at least one image.";
    return null;
  }

  function validateShared(): string | null {
    if (!state) return "Please select a state. It applies to every product in this batch.";
    if (sellerName.trim().length < 2) return "Enter your business or seller name.";
    return null;
  }

  function buildItem(): QueuedProduct {
    return {
      name: name.trim(),
      price: cleanNumber(price),
      quantity: cleanNumber(quantity),
      minimumOrder: cleanNumber(minimumOrder),
      unit,
      category,
      subcategory,
      description: description.trim(),
      imageFiles,
      previews,
    };
  }

  function handleAddToList() {
    setError("");
    const validationError = validateCurrentProduct();
    if (validationError) {
      setError(validationError);
      return;
    }
    const sharedError = validateShared();
    if (sharedError) {
      setError(sharedError);
      return;
    }
    if (queue.length >= MAX_BATCH) {
      setError("You can line up at most " + MAX_BATCH + " products at a time.");
      return;
    }
    setQueue(function (prev) { return [...prev, buildItem()]; });
    resetProductFields();
  }

  function removeFromQueue(index: number) {
    const item = queue[index];
    if (item) {
      item.previews.forEach(function (url) { URL.revokeObjectURL(url); });
      uploadedRef.current.delete(item);
    }
    setQueue(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
  }

  async function publishOne(item: QueuedProduct) {
    let urls = uploadedRef.current.get(item);
    if (!urls) {
      const fresh: string[] = [];
      for (const file of item.imageFiles) {
        const url = await uploadProductImage(file);
        if (!url) throw new Error("Image upload failed for \"" + item.name + "\".");
        fresh.push(url);
      }
      uploadedRef.current.set(item, fresh);
      urls = fresh;
    }

    const { error: rpcError } = await supabase.rpc("create_product", {
      p_name: item.name,
      p_price: Number(item.price),
      p_quantity: item.quantity,
      p_unit: item.unit,
      p_category: item.category,
      p_subcategory: item.subcategory || null,
      p_state: state,
      p_city: city.trim() || null,
      p_description: item.description || null,
      p_images: urls,
      p_minimum_order_quantity: item.minimumOrder ? Number(item.minimumOrder) : null,
      p_seller_name: sellerName.trim() || null,
    });
    if (rpcError) throw new Error(rpcError.message || "Could not publish \"" + item.name + "\".");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !user) return;
    setError("");

    const sharedError = validateShared();
    if (sharedError) {
      setError(sharedError);
      return;
    }

    let toPublish: QueuedProduct[] = queue;

    if (currentFormIsFilled()) {
      const validationError = validateCurrentProduct();
      if (validationError) {
        setError(validationError);
        return;
      }
      if (queue.length >= MAX_BATCH) {
        setError("You can publish at most " + MAX_BATCH + " products at a time.");
        return;
      }
      toPublish = [...queue, buildItem()];
      setQueue(toPublish);
      resetProductFields();
    }

    if (toPublish.length === 0) {
      setError("Add at least one product before publishing.");
      return;
    }

    setLoading(true);
    let published = 0;
    try {
      for (const item of toPublish) {
        setProgressText("Publishing " + (published + 1) + " of " + toPublish.length + "...");
        await publishOne(item);
        published += 1;
        uploadedRef.current.delete(item);
        item.previews.forEach(function (url) { URL.revokeObjectURL(url); });
        setQueue(function (prev) { return prev.filter(function (q) { return q !== item; }); });
      }
      window.location.href = "/seller-dashboard";
    } catch (err: any) {
      console.error("Product publish error:", err);
      const base = err?.message || "Failed to publish.";
      setError(
        published > 0
          ? base + " " + published + " product" + (published === 1 ? " was" : "s were") + " published. The rest are still in your list. Press Publish to retry."
          : base + " Your list is kept. Press Publish to retry."
      );
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
              {queue.map(function (item, i) {
                return (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#FED7AA]">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.previews[0] && (
                        <img src={item.previews[0]} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">{item.name}</p>
                        <p className="text-xs text-[#6B7280]">&#8358;{Number(item.price).toLocaleString("en-NG")} - {item.imageFiles.length} image{item.imageFiles.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={function () { removeFromQueue(i); }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex-shrink-0 ml-3 disabled:text-gray-300"
                    >
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
                    maxLength={150}
                    value={name}
                    onChange={function (e) { setName(e.target.value); }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price (&#8358;) *</label>
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={price}
                    onChange={function (e) { setPrice(e.target.value); }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className={labelClass}>Quantity Available *</label>
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={quantity}
                    onChange={function (e) { setQuantity(e.target.value); }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit *</label>
                  <select
                    className={inputClass}
                    value={unit}
                    onChange={function (e) { setUnit(e.target.value); }}
                  >
                    <option value="">Select unit</option>
                    {UNITS.map(function (u) {
                      return <option key={u[0]} value={u[0]}>{u[1]}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="mt-6 md:w-1/2 md:pr-3">
                <label className={labelClass}>Minimum Order Quantity</label>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={minimumOrder}
                  onChange={function (e) { setMinimumOrder(e.target.value); }}
                />
                <p className="text-xs text-[#6B7280] mt-1.5">Optional. Buyers cannot request a quote below this amount.</p>
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
                    onChange={function (e) { handleCategoryChange(e.target.value); }}
                    disabled={loadingCats}
                  >
                    <option value="">
                      {loadingCats ? "Loading..." : "Select category"}
                    </option>
                    {parentCategories.map(function (cat) {
                      return (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Subcategory</label>
                  <select
                    className={inputClass}
                    value={subcategory}
                    onChange={function (e) { setSubcategory(e.target.value); }}
                    disabled={subcategories.length === 0}
                  >
                    <option value="">
                      {subcategories.length === 0 ? "Select category first" : "Select subcategory"}
                    </option>
                    {subcategories.map(function (sub) {
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
                    onChange={function (e) { setState(e.target.value); }}
                  >
                    <option value="">Select state</option>
                    {nigerianStates.map(function (s) {
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
                    maxLength={100}
                    value={city}
                    onChange={function (e) { setCity(e.target.value); }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Business Info */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Business Information</h3>
              <p className="text-xs text-[#6B7280] -mt-4 mb-6">Applies to every product in this batch.</p>

              {profileCompany ? (
                <div>
                  <label className={labelClass}>Business / Seller Name</label>
                  <input className={inputClass + " bg-[#F9FAFB]"} value={profileCompany} readOnly />
                  <p className="text-xs text-[#6B7280] mt-1.5">Taken from your profile. Update it in Profile Settings.</p>
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Business / Seller Name *</label>
                  <input
                    className={inputClass}
                    placeholder="Your business name"
                    maxLength={120}
                    value={sellerName}
                    onChange={function (e) { setSellerName(e.target.value); }}
                  />
                </div>
              )}
            </div>

            {/* Section 5: Description */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Details</h3>

              <div>
                <label className={labelClass}>Product Description</label>
                <textarea
                  rows={4}
                  maxLength={5000}
                  className={inputClass + " resize-none"}
                  placeholder="Quality, grade, processing method, delivery options..."
                  value={description}
                  onChange={function (e) { setDescription(e.target.value); }}
                />
              </div>
            </div>

            {/* Section 6: Images */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-2">Product Images</h3>
              <p className="text-xs text-[#6B7280] mb-6">At least 1 image, up to {MAX_IMAGES}. JPG, PNG, WEBP or GIF, 10MB each.</p>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {previews.map(function (src, i) {
                    return (
                      <div key={src} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5E7EB]">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={function () { removeImageAt(i); }}
                          aria-label="Remove image"
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          &times;
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
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  id="image-upload"
                  onChange={function (e) {
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
                </label>
              </div>
            </div>

            {/* Add to batch */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <button
                type="button"
                disabled={loading}
                onClick={handleAddToList}
                className="w-full bg-white border-2 border-[#F97316] text-[#F97316] hover:bg-[#FFF7ED] font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
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