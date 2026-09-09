// One curated, category-accurate image per category — used for
// catalogue-only products that have no seller-uploaded photo yet.
// Broad category keywords (e.g. "vegetables", "machinery") are reliably
// accurate, unlike specific product-name keywords which can misfire.

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "grains & cereals": "https://loremflickr.com/400/400/grains,cereal",
  "vegetables": "https://loremflickr.com/400/400/vegetables,market",
  "fruits": "https://loremflickr.com/400/400/fruits,fresh",
  "tubers & roots": "https://loremflickr.com/400/400/yam,tuber",
  "legumes, nuts & seeds": "https://loremflickr.com/400/400/nuts,legumes",
  "spices & herbs": "https://loremflickr.com/400/400/spices,herbs",
  "oils & butters": "https://loremflickr.com/400/400/cooking,oil",
  "construction": "https://loremflickr.com/400/400/construction,building",
  "chemicals": "https://loremflickr.com/400/400/chemical,industrial",
  "machinery": "https://loremflickr.com/400/400/machinery,factory",
  "agriculture & food": "https://loremflickr.com/400/400/agriculture,farm",
  "apparel & accessories": "https://loremflickr.com/400/400/clothing,fabric",
  "computer products": "https://loremflickr.com/400/400/computer,electronics",
  "consumer electronics": "https://loremflickr.com/400/400/electronics,gadget",
  "electrical & electronics": "https://loremflickr.com/400/400/electrical,wiring",
  "furniture": "https://loremflickr.com/400/400/furniture,wood",
  "health & medicine": "https://loremflickr.com/400/400/medicine,pharmacy",
  "industrial equipment": "https://loremflickr.com/400/400/industrial,equipment",
  "lights & lighting": "https://loremflickr.com/400/400/lighting,bulb",
  "metallurgy & energy": "https://loremflickr.com/400/400/steel,metal",
  "office supplies": "https://loremflickr.com/400/400/office,stationery",
  "packaging & printing": "https://loremflickr.com/400/400/packaging,boxes",
  "raw materials": "https://loremflickr.com/400/400/rawmaterial,industrial",
  "security & protection": "https://loremflickr.com/400/400/security,safety",
  "sporting goods": "https://loremflickr.com/400/400/sports,fitness",
  "textile": "https://loremflickr.com/400/400/textile,fabric",
  "tools & hardware": "https://loremflickr.com/400/400/tools,hardware",
  "transportation": "https://loremflickr.com/400/400/transport,vehicle",
  "wholesale": "https://loremflickr.com/400/400/warehouse,bulk",
};

const DEFAULT_IMAGE = "https://loremflickr.com/400/400/marketplace,warehouse";

export function getCategoryImage(category?: string): string {
  if (!category) return DEFAULT_IMAGE;
  const key = category.trim().toLowerCase();
  return CATEGORY_IMAGE_MAP[key] || DEFAULT_IMAGE;
}
