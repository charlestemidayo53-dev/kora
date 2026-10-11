export const SITE_NAME = "Kora Marketplace";
export const SITE_TAGLINE = "Discover. Connect. Trade.";
export const SITE_URL = "https://korafrica.com";
export const DEFAULT_TITLE = "Kora Marketplace | African B2B Trading Platform";
export const DEFAULT_DESCRIPTION =
  "Discover African suppliers, manufacturers, wholesalers and bulk products on Kora Marketplace. Connect with business trading partners across Africa and international markets.";

export const SEO_KEYWORDS = [
  "African B2B marketplace",
  "African suppliers",
  "African manufacturers",
  "wholesale suppliers Africa",
  "bulk products Africa",
  "buy African products",
  "African exporters",
  "agricultural products Africa",
  "buy in bulk Africa",
  "B2B trade Africa",
];

// Existing file in /public (space encoded). Replace with a 1200x630 image when you have one.
export const DEFAULT_OG_IMAGE = "/kora%20logo.jpeg";

// Real Kora private routes. Never crawled, never in the sitemap.
export const PRIVATE_PATHS = [
  "/admin",
  "/dashboard",
  "/auth",
  "/message",
  "/cart",
  "/orders",
  "/order-review",
  "/b2b-orders",
  "/wallet",
  "/escrow",
  "/settings",
  "/seller-dashboard",
  "/complete-profile",
  "/add-product",
  "/edit-product",
  "/verification",
  "/post%20rfq",
  "/api",
];

// Filter/sort/search variants that should never become indexable duplicates.
export const BLOCKED_QUERY_PARAMS = ["sort", "view", "location", "q"];
// Bulk-imported "discovered" listings are not seller-uploaded. They stay out of Google
// (noindex + not in the sitemap) until you confirm they are real, current supply.
export const INDEX_DISCOVERED_LISTINGS = false;
// products.category holds mixed values ("Agriculture & Food", "agriculture-food", "Agriculture").
// Aliases fold near-duplicates into one canonical category slug.
export const CATEGORY_ALIASES: Record<string, string> = {
  agriculture: "agriculture-food",
};

// Category pages with fewer products than this stay noindex and out of the sitemap.
export const MIN_CATEGORY_PRODUCTS_TO_INDEX = 3;