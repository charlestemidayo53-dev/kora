const PEXELS_API_URL = "https://api.pexels.com/v1/search";

export interface ProductImageResult {
  image_url: string;
  image_source: string;
  image_credit: string;
  image_credit_url: string;
}

export async function searchProductImage(query: string): Promise<ProductImageResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error("PEXELS_API_KEY is not set");
    return null;
  }

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
