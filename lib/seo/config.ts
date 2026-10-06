export const SITE_NAME = "Kora";
export const SITE_URL = "https://korafrica.com";
export const DEFAULT_TITLE = "Kora | African B2B Marketplace";
export const DEFAULT_DESCRIPTION =
  "Kora connects African businesses with suppliers, manufacturers, producers, distributors and buyers for bulk trade. Source agricultural and industrial products, request quotes and trade across Africa.";

export const SEO_KEYWORDS = [
  "African B2B marketplace",
  "bulk products Africa",
  "Nigerian suppliers",
  "African manufacturers",
  "wholesale suppliers Nigeria",
  "agricultural exports Africa",
  "buy in bulk Africa",
  "African exporters",
  "industrial supplies Nigeria",
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