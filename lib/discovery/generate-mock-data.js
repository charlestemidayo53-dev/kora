const fs = require("fs");
const path = require("path");

const TARGET = parseInt(process.argv[2] || "500", 10);

const SOURCES = ["Mock Source A", "Mock Source B", "Mock Source C", "Mock Source D", "Mock Source E"];
const CHINA_SOURCE = "Mock Source C (China)";

const QUALIFIERS = ["", "White", "Fresh", "Dried", "Grade A", "Grade B", "Premium", "Local", "Organic", "Whole"];

const CATEGORIES = {
  "Grains & Cereals": { weight: 5, unit: "kg", priceRange: [400, 1500], names: [
    "Gari","Rice","Maize","Millet","Sorghum","Wheat Grain","Brown Rice","Ofada Rice","Guinea Corn","Barley","Oat","Rye"
  ]},
  "Vegetables": { weight: 5, unit: "kg", priceRange: [300, 1200], names: [
    "Tomatoes","Bell Pepper","Onions","Cabbage","Okra","Spinach (Ugu)","Carrot","Cucumber","Lettuce","Green Beans","Scotch Bonnet Pepper","Garden Egg","Pumpkin Leaves","Water Leaf"
  ]},
  "Fruits": { weight: 4, unit: "kg", priceRange: [400, 1200], names: [
    "Watermelon","Pineapple","Mango","Banana","Oranges","Pawpaw","Guava","Avocado","Plantain","Grapes","Lemon","Coconut"
  ]},
  "Tubers & Roots": { weight: 4, unit: "kg", priceRange: [350, 1600], names: [
    "Ginger","Cassava Flour","Yam Tubers","Sweet Potato","Cocoyam","Irish Potato","Turmeric Root","Garri Flour","Plantain Flour"
  ]},
  "Legumes, Nuts & Seeds": { weight: 4, unit: "kg", priceRange: [900, 3800], names: [
    "Groundnut","Soybeans","Cashew Nuts","Sesame Seed","Cocoa Beans","Bambara Nut","Melon Seed (Egusi)","Black-eyed Beans","Brown Beans","Tiger Nut","Walnut","Almond"
  ]},
  "Spices & Herbs": { weight: 3, unit: "kg", priceRange: [1500, 4500], names: [
    "Dried Pepper","Ginger Powder","Turmeric Powder","Uziza Seed","Curry Leaf","Bay Leaf","Cloves","Cinnamon","Nutmeg","Bitter Kola","Kola Nut","Cameroon Pepper"
  ]},
  "Oils & Butters": { weight: 3, unit: "litre", priceRange: [1500, 2500], names: [
    "Palm Oil","Groundnut Oil","Shea Butter","Coconut Oil","Palm Kernel Oil","Sesame Oil","Castor Oil"
  ]},
  "Construction": { weight: 2, unit: "unit", priceRange: [3000, 15000], names: [
    "Cement","Iron Rods","Roofing Sheets","Blocks","Sand (Tipper Load)","Granite Chippings","Plywood","Nails","Wire Mesh","Roofing Nails"
  ]},
  "Chemicals": { weight: 2, unit: "bag", priceRange: [4000, 20000], names: [
    "Agricultural Lime","NPK Fertilizer","Urea Fertilizer","Pesticide Concentrate","Herbicide","Fungicide","Soil Conditioner","Foliar Feed"
  ]},
  "Machinery": { weight: 2, unit: "unit", priceRange: [1500000, 5000000], names: [
    "Ginger Processing Machine","Cassava Grating Machine","Palm Oil Press Machine","Rice Milling Machine","Grain Dryer",
    "Groundnut Sheller","Fruit Juice Extractor","Feed Pelletizing Machine","Cocoa Processing Machine","Flour Milling Machine",
    "Cassava Peeling Machine","Maize Sheller"
  ]},
};

function randPrice([min, max]) {
  return Math.round((min + Math.random() * (max - min)) / 10) * 10;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const pool = [];
for (const [cat, cfg] of Object.entries(CATEGORIES)) {
  for (let i = 0; i < cfg.weight; i++) pool.push(cat);
}

const items = [];
let guard = 0;
while (items.length < TARGET && guard < TARGET * 10) {
  guard++;
  const cat = pick(pool);
  const cfg = CATEGORIES[cat];
  const base = pick(cfg.names);
  const isMachinery = cat === "Machinery";
  const qualifier = isMachinery ? "" : pick(QUALIFIERS);
  const name = qualifier ? `${qualifier} ${base}` : base;
  const source = isMachinery ? CHINA_SOURCE : pick(SOURCES);

  items.push({
    name,
    category: cat,
    price: randPrice(cfg.priceRange),
    unit: cfg.unit,
    source_name: source,
  });
}

fs.writeFileSync(path.join(__dirname, "mock-data.json"), JSON.stringify(items, null, 2));
console.log(`Generated ${items.length} items`);
const dist = {};
for (const it of items) dist[it.category] = (dist[it.category] || 0) + 1;
console.log(dist);
