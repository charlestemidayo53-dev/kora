const PEXELS_API_URL = "https://api.pexels.com/v1/search";

export interface ProductImageResult {
  image_url: string;
  image_source: string;
  image_credit: string;
  image_credit_url: string;
}

const QUALIFIER_WORDS = [
  "grade a", "grade b", "white", "fresh", "dried", "whole",
  "premium", "local", "organic", "yellow",
];

const CATEGORY_CONTEXT: Record<string, string> = {
  "grains & cereals": "grain",
  "vegetables": "vegetable",
  "fruits": "fruit",
  "tubers & roots": "root vegetable",
  "legumes, nuts & seeds": "seeds",
  "spices & herbs": "spice",
  "oils & butters": "cooking oil bottle",
  "construction": "construction material",
  "chemicals": "industrial chemical",
  "machinery": "industrial machine",
};

function stripQualifiers(name: string): string {
  let n = name.toLowerCase();
  for (const q of QUALIFIER_WORDS) {
    n = n.replace(new RegExp("\\b" + q + "\\b", "g"), "");
  }
  return n.replace(/\s+/g, " ").trim();
}

function buildSearchQuery(name: string, category?: string): string {
  const stripped = stripQualifiers(name);
  const key = (category || "").toLowerCase();
  const context = CATEGORY_CONTEXT[key];
  return context ? stripped + " " + context : stripped;
}

export async function searchProductImage(name: string, category?: string): Promise<ProductImageResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error("PEXELS_API_KEY is not set");
    return null;
  }

  const query = buildSearchQuery(name, category);

  try {
    const url = PEXELS_API_URL + "?query=" + encodeURIComponent(query) + "&per_page=1&orientation=square";
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) {
      console.error("Pexels search failed for", query, res.status);
      return null;
    }

    const data = await res.json();
    const photo = data?.photos?.[0];
    if (!photo) return null;

    return {
      image_url: photo.src.large || photo.src.medium,
      image_source: "pexels",
      image_credit: photo.photographer,
      image_credit_url: photo.photographer_url,
    };
  } catch (err) {
    console.error("Pexels search error for", query, err);
    return null;
  }
}
