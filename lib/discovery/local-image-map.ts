// Maps catalogue product names to real, user-uploaded photos already in
// /public. Ordered most-specific first so e.g. "water pump" is checked
// before a generic single-word match could apply.

const MAPPINGS: { keywords: string[]; filename: string }[] = [
  { keywords: ["water pump"], filename: "water pumps.jpg" },
  { keywords: ["roofing sheet"], filename: "Roofing Sheets.jpg" },
  { keywords: ["iron sheet"], filename: "Iron Sheets,.jpg" },
  { keywords: ["metal pipe"], filename: "Metal Pipes,.jpg" },
  { keywords: ["rice transplant"], filename: "Rice Transplanters..jpg" },
  { keywords: ["seed drill"], filename: "Seed Drills.jpg" },
  { keywords: ["welding rod"], filename: "Welding Rods - Copy.jpg" },
  { keywords: ["food packaging"], filename: "Food Packaging Bags.jpg" },
  { keywords: ["organic compost"], filename: "Organic Compost.jpg" },
  { keywords: ["cold room"], filename: "cold room engine.jpg" },
  { keywords: ["oil machine", "oil press"], filename: "oil machine.jpg" },
  { keywords: ["millet"], filename: "1778628153256-millet - Copy.jpg" },
  { keywords: ["honey"], filename: "1778627800148-Honey.jpg" },
  { keywords: ["apple"], filename: "app.jpg" },
  { keywords: ["avocado"], filename: "av.jpg" },
  { keywords: ["banana"], filename: "ba.jpg" },
  { keywords: ["cashew"], filename: "ca ca - Copy.jpg" },
  { keywords: ["coconut"], filename: "coco.jpg" },
  { keywords: ["dap"], filename: "DAP.jpg" },
  { keywords: ["urea"], filename: "Urea.jpg" },
  { keywords: ["npk"], filename: "npk fer.jpg" },
  { keywords: ["orange"], filename: "oran.jpg" },
  { keywords: ["pineapple"], filename: "pen.jpg" },
  { keywords: ["plantain"], filename: "pla.webp" },
  { keywords: ["watermelon"], filename: "wa.jpg" },
  { keywords: ["sunflower"], filename: "sun.jpg" },
  { keywords: ["nail"], filename: "Nails2.jpg" },
  { keywords: ["paint"], filename: "Paints - Copy.jpg" },
  { keywords: ["plywood"], filename: "Plywood - Copy.jpg" },
  { keywords: ["plough"], filename: "Ploughs.jpg" },
  { keywords: ["seedling"], filename: "Seedlings - Copy.jpg" },
  { keywords: ["sprayer"], filename: "sprayer - Copy.jpg" },
  { keywords: ["coolant"], filename: "coolant.jpg" },
  { keywords: ["pipe"], filename: "Pipes.jpg" },
];

export function matchLocalImage(productName: string): string | null {
  const name = productName.toLowerCase();
  for (const entry of MAPPINGS) {
    for (const keyword of entry.keywords) {
      if (name.includes(keyword)) {
        return "/" + encodeURIComponent(entry.filename);
      }
    }
  }
  return null;
}
