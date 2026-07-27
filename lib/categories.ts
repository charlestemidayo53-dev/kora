export type Category = {
  name: string;
  slug: string;
  icon: React.ReactNode;
  subcategories: string[];
};

export const categories: Category[] = [
  {
    name: "Agriculture & Food", slug: "agriculture-food",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22V12M8 6C8 6 7 9 9 11C9 11 11 8 14 8C14 8 13 12 10 13C10 13 13 15 16 13" /><path d="M12 12C12 12 6 10 5 4C5 4 10 4 12 8" /></svg>,
    subcategories: ["Cash Crops","Grains & Cereals","Fruits & Vegetables","Livestock & Poultry","Dairy Products","Seafood & Fishery","Spices & Herbs","Processed Food","Animal Feed","Fertilizers & Inputs","Seeds & Seedlings","Agri Machinery"],
  },
  // ...paste the rest of the categories exactly as they are in SiteShell.tsx...
];