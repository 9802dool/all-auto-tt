export const brand = {
  name: "ALL AUTO TT",
  short: "ALL AUTO",
  tagline: "Every Part. Every Dealer. All Trinidad & Tobago.",
  domain: "allautott.com",
  url: "https://allautott.com",
  email: "allautott@gmail.com",
  phone: "18683224691",
  whatsapp: "18683224691",
} as const;

export const demoAccounts = {
  admin: { email: "allautott@gmail.com", password: "demo-admin", name: "Platform Admin" },
  dealer: { password: "demo-dealer" },
} as const;

export const conditions = ["Used – Tested", "Used – Untested", "Refurbished"] as const;

export const transmissions = ["Automatic", "Manual", "CVT", "Tiptronic", "Unknown"] as const;

export const partStatuses = ["available", "reserved", "sold", "removed"] as const;

export const regions = [
  { name: "Port of Spain", lat: 10.6596, lng: -61.5086 },
  { name: "Diego Martin", lat: 10.7206, lng: -61.5662 },
  { name: "San Juan", lat: 10.6504, lng: -61.45 },
  { name: "Tunapuna", lat: 10.6525, lng: -61.3889 },
  { name: "Arima", lat: 10.6374, lng: -61.2823 },
  { name: "Sangre Grande", lat: 10.587, lng: -61.1301 },
  { name: "Chaguanas", lat: 10.5168, lng: -61.411 },
  { name: "Couva", lat: 10.4225, lng: -61.4675 },
  { name: "San Fernando", lat: 10.2797, lng: -61.4683 },
  { name: "Princes Town", lat: 10.2718, lng: -61.3822 },
  { name: "Penal", lat: 10.1667, lng: -61.4667 },
  { name: "Point Fortin", lat: 10.1742, lng: -61.6842 },
  { name: "Siparia", lat: 10.1453, lng: -61.5074 },
  { name: "Rio Claro", lat: 10.3058, lng: -61.1756 },
  { name: "Tobago", lat: 11.1833, lng: -60.7333 },
] as const;

export const categories = [
  { name: "Engine", slug: "engines", seoName: "Engines", icon: "Cog" },
  { name: "Gearbox/Transmission", slug: "gearboxes", seoName: "Gearboxes", icon: "Settings2" },
  { name: "Body Parts", slug: "body-parts", seoName: "Body Parts", icon: "Car" },
  { name: "Suspension", slug: "suspension", seoName: "Suspension Parts", icon: "MoveVertical" },
  { name: "Electrical", slug: "electrical", seoName: "Electrical Parts", icon: "Zap" },
  { name: "Interior", slug: "interior", seoName: "Interior Parts", icon: "Armchair" },
  { name: "Wheels & Tyres", slug: "wheels-tyres", seoName: "Wheels and Tyres", icon: "CircleDot" },
  { name: "Lights", slug: "lights", seoName: "Lights", icon: "Lightbulb" },
  { name: "Other", slug: "other", seoName: "Parts", icon: "Package" },
] as const;

export const makes = [
  {
    name: "Toyota",
    models: ["Allion", "Aqua", "Axio", "Corolla", "Fielder", "Hiace", "Hilux", "Isis", "Noah", "Premio", "RAV4", "Vitz", "Wish"],
  },
  {
    name: "Nissan",
    models: ["AD Wagon", "Cube", "Lafesta", "March", "Note", "Serena", "Sylphy", "Tiida", "Wingroad", "X-Trail"],
  },
  {
    name: "Honda",
    models: ["Accord", "Civic", "CR-V", "Fit", "Freed", "Stream", "Vezel"],
  },
  {
    name: "Mazda",
    models: ["Atenza", "Axela", "CX-5", "Demio", "Premacy"],
  },
  {
    name: "Mitsubishi",
    models: ["ASX", "Galant", "Lancer", "Outlander", "Pajero"],
  },
  {
    name: "Suzuki",
    models: ["Alto", "Baleno", "Escudo", "Swift", "Vitara"],
  },
  {
    name: "Hyundai",
    models: ["Accent", "Creta", "Elantra", "H1", "Sonata", "Tucson"],
  },
  {
    name: "Kia",
    models: ["Cerato", "Picanto", "Rio", "Sorento", "Sportage"],
  },
] as const;

export const popularMakes = ["Toyota", "Nissan", "Honda", "Mazda", "Mitsubishi", "Suzuki", "Hyundai", "Kia"] as const;

export const plans = {
  free: {
    id: "free" as const,
    name: "Free",
    price: 0,
    listings: 10,
    perks: ["Up to 10 live listings", "Shareable storefront", "WhatsApp and call buttons"],
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    price: 200,
    listings: 150,
    perks: ["Up to 150 live listings", "Verified dealer badge", "Views, WhatsApp clicks and inquiries", "Full part-request details"],
  },
  premium: {
    id: "premium" as const,
    name: "Premium",
    price: 400,
    listings: null,
    perks: ["Unlimited listings", "Priority in recommended search", "Eligible for homepage spotlight", "Verified dealer badge", "Full lead stats and part requests"],
  },
};

export const featuredBoost = { price: 50, days: 7 };

export const listingLifetimeDays = 60;
export const soldVisibleDays = 7;

export const extras = [
  {
    id: "upload_stock" as const,
    name: "We upload your stock",
    price: 350,
    detail: "Send photos and a spreadsheet. We create up to 40 listings on your storefront.",
  },
  {
    id: "photo_service" as const,
    name: "Photo service",
    price: 250,
    detail: "A photographer visits your yard in Trinidad and shoots the parts you want listed.",
  },
];

export const adRates = [
  { placement: "Homepage banner", price: "TT$400 / week", note: "Above the latest arrivals." },
  { placement: "Search results", price: "TT$250 / week", note: "Between results and in the sidebar." },
  { placement: "Part page", price: "TT$200 / week", note: "Under the dealer card, where buyers decide." },
  { placement: "Dealer of the Month", price: "TT$600", note: "Homepage spotlight for 30 days." },
];

export const bank = {
  bank: "Republic Bank Limited",
  name: "ALL AUTO TT",
  account: "080 123 456 789",
  type: "Chequing (TTD)",
  note: "Put your business name as the transfer reference. This account number is a placeholder until the live account is connected.",
};

export const reportReasons = [
  "Already sold",
  "Fake or misleading",
  "Wrong vehicle",
  "Wrong price",
  "Spam",
  "Other",
] as const;

export const pageSize = 12;

export const reservedSlugs = new Set([
  "admin",
  "advertise",
  "api",
  "browse",
  "dealer",
  "dealers",
  "feed",
  "for-dealers",
  "login",
  "new",
  "parts",
  "request",
  "safety",
  "share",
]);

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || brand.url).replace(/\/$/, "");
}

export function regionPoint(name: string) {
  return regions.find((region) => region.name === name) ?? null;
}

export function categoryByName(name: string) {
  return categories.find((category) => category.name === name) ?? null;
}

export function categoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug) ?? null;
}

export function makeBySlug(slug: string) {
  return makes.find((make) => slugifyMake(make.name) === slug) ?? null;
}

export function slugifyMake(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
