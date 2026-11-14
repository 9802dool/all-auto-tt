import { categories, makes, regions } from "@/lib/config";
import { daysFromNow, slugify } from "@/lib/format";
import type { DB, Dealer, Part, PartRequest, Payment, Review } from "@/lib/types";

const DEALER_HASH = "allautott-dealer-salt:4047581f51e9f3abd918e1041b04c11f94863d1268ff5534b71de5308d0f50b2";

const now = () => Date.now();

function blurb(detail: string, place: string, tested: boolean) {
  const check = tested
    ? "It was tested in the yard before listing."
    : "Sold as seen — inspect it on the bench before you pay.";
  return `SAMPLE LISTING. ${detail} In ${place}. ${check} Cash on pickup at the shop. This is an example, not a real part for sale.`;
}

function part(
  input: Pick<Part, "id" | "title" | "dealer_id" | "category" | "make" | "model" | "price_ttd" | "photos" | "location" | "description"> &
    Partial<Part>,
): Part {
  const created = input.created_at ?? daysFromNow(-12, now());
  return {
    slug: slugify(input.title),
    year_from: null,
    year_to: null,
    engine_code: "",
    transmission_type: "Automatic",
    condition: "Foreign-used",
    negotiable: false,
    status: "available",
    featured: false,
    featured_until: null,
    views: 18,
    whatsapp_clicks: 2,
    call_clicks: 1,
    inquiry_count: 0,
    expires_at: daysFromNow(45, now()),
    sold_at: null,
    renewed_at: null,
    expiry_reminder_for: null,
    example: true,
    created_at: created,
    updated_at: created,
    ...input,
  };
}

export function createSeed(): DB {
  const stamp = new Date().toISOString();
  const users = [
    { id: "u_admin", email: "admin@allautott.example", password_hash: DEALER_HASH, name: "Simeon", phone: "18683224691", role: "admin" as const, created_at: stamp },
    { id: "u_central", email: "akeem@centralparts.example", password_hash: DEALER_HASH, name: "Akeem Ramdass", phone: "18685550101", role: "dealer" as const, created_at: stamp },
    { id: "u_south", email: "lisa@southside.example", password_hash: DEALER_HASH, name: "Lisa Mohammed", phone: "18685550102", role: "dealer" as const, created_at: stamp },
    { id: "u_east", email: "ron@eastyard.example", password_hash: DEALER_HASH, name: "Ron Charles", phone: "18685550103", role: "dealer" as const, created_at: stamp },
    { id: "u_crown", email: "maya@crownpoint.example", password_hash: DEALER_HASH, name: "Maya George", phone: "18685550104", role: "dealer" as const, created_at: stamp },
  ];

  const dealers: Dealer[] = [
    {
      id: "d_central",
      owner_user_id: "u_central",
      business_name: "Central Foreign Used Parts (Sample)",
      slug: "central-foreign-used-parts",
      contact_name: "Akeem Ramdass",
      phone: "18685550101",
      whatsapp: "18685550101",
      email: "akeem@centralparts.example",
      region: "Chaguanas",
      address: "14 Endeavour Road, Chaguanas",
      lat: regions.find((region) => region.name === "Chaguanas")!.lat,
      lng: regions.find((region) => region.name === "Chaguanas")!.lng,
      hours: "Mon–Fri 8:00am–5:00pm, Sat 8:00am–2:00pm",
      logo: "/dealers/logo-central.svg",
      cover: "/dealers/garage.jpg",
      about: "Sample yard — not a real shop. Example Toyota and Honda parts in Chaguanas so buyers can see how a storefront looks. WhatsApp and call buttons use a sample number.",
      registration_number: "BN-2014-88321",
      status: "approved",
      verified: true,
      plan: "pro",
      plan_expires_at: daysFromNow(6, now()),
      plan_reminder_for: null,
      rating_avg: 4.5,
      rating_count: 2,
      example: true,
      created_at: daysFromNow(-80, now()),
    },
    {
      id: "d_south",
      owner_user_id: "u_south",
      business_name: "South Side Breakers (Sample)",
      slug: "south-side-breakers",
      contact_name: "Lisa Mohammed",
      phone: "18685550102",
      whatsapp: "18685550102",
      email: "lisa@southside.example",
      region: "San Fernando",
      address: "88 Cipero Street, San Fernando",
      lat: regions.find((region) => region.name === "San Fernando")!.lat,
      lng: regions.find((region) => region.name === "San Fernando")!.lng,
      hours: "Mon–Sat 8:00am–4:30pm",
      logo: "/dealers/logo-south.svg",
      cover: "/dealers/yard.jpg",
      about: "Sample yard — not a real shop. Example Nissan parts in San Fernando, including Tiida, B15 and AD Wagon. Come through the page the way a buyer would, then message the shop.",
      registration_number: "BN-2018-12044",
      status: "approved",
      verified: true,
      plan: "premium",
      plan_expires_at: daysFromNow(40, now()),
      plan_reminder_for: null,
      rating_avg: 4,
      rating_count: 2,
      example: true,
      created_at: daysFromNow(-120, now()),
    },
    {
      id: "d_east",
      owner_user_id: "u_east",
      business_name: "East Yard Spares (Sample)",
      slug: "east-yard-spares",
      contact_name: "Ron Charles",
      phone: "18685550103",
      whatsapp: "18685550103",
      email: "ron@eastyard.example",
      region: "Arima",
      address: "22 Tumpuna Road, Arima",
      lat: regions.find((region) => region.name === "Arima")!.lat,
      lng: regions.find((region) => region.name === "Arima")!.lng,
      hours: "Mon–Fri 8:30am–4:30pm, Sat 9:00am–1:00pm",
      logo: "/dealers/logo-east.svg",
      cover: "/parts/workshop.jpg",
      about: "Sample yard — not a real shop. Example Honda, Hyundai, Kia and Suzuki Swift parts in Arima. The free plan is on this shop so the listing limit is visible.",
      registration_number: "",
      status: "approved",
      verified: false,
      plan: "free",
      plan_expires_at: null,
      plan_reminder_for: null,
      rating_avg: 0,
      rating_count: 0,
      example: true,
      created_at: daysFromNow(-30, now()),
    },
    {
      id: "d_crown",
      owner_user_id: "u_crown",
      business_name: "Crown Point Auto Parts (Sample)",
      slug: "crown-point-auto-parts",
      contact_name: "Maya George",
      phone: "18685550104",
      whatsapp: "18685550104",
      email: "maya@crownpoint.example",
      region: "Tobago",
      address: "5 Milford Road, Scarborough, Tobago",
      lat: regions.find((region) => region.name === "Tobago")!.lat,
      lng: regions.find((region) => region.name === "Tobago")!.lng,
      hours: "Tue–Sat 9:00am–4:00pm",
      logo: "/dealers/logo-crown.svg",
      cover: "/dealers/night.jpg",
      about: "Sample yard — not a real shop. This Tobago account is waiting for approval, so buyers cannot see it until an admin approves it.",
      registration_number: "",
      status: "pending",
      verified: false,
      plan: "free",
      plan_expires_at: null,
      plan_reminder_for: null,
      rating_avg: 0,
      rating_count: 0,
      example: true,
      created_at: daysFromNow(-2, now()),
    },
  ];

  const photo = {
    engine: ["/parts/engine.jpg", "/parts/engine-2.jpg"],
    bench: ["/parts/tools.jpg", "/parts/workshop.jpg"],
    front: ["/parts/front.jpg", "/parts/classic.jpg"],
    body: ["/parts/silver.jpg", "/parts/front.jpg"],
    light: ["/parts/detail.jpg", "/parts/front.jpg"],
    suv: ["/parts/suv.jpg", "/parts/silver.jpg"],
    seat: ["/parts/classic.jpg", "/parts/coupe.jpg"],
    wheel: ["/parts/wheel.jpg", "/parts/tire.jpg"],
    shop: ["/parts/workshop.jpg", "/parts/detail.jpg"],
    detail: ["/parts/detail.jpg", "/parts/tools.jpg"],
  } as const;

  const sampleRows: Array<{
    id: string;
    title: string;
    dealer_id: string;
    category: string;
    make: string;
    model: string;
    year_from: number;
    year_to: number;
    price_ttd: number;
    location: string;
    shot: keyof typeof photo;
    note: string;
    engine_code?: string;
    condition?: string;
    transmission_type?: string;
    negotiable?: boolean;
    status?: Part["status"];
    soldDaysAgo?: number;
    featured?: boolean;
    expiresIn?: number;
    createdDaysAgo?: number;
    tested?: boolean;
  }> = [
    { id: "p01", title: "2014 Toyota Corolla Gearbox", dealer_id: "d_central", category: "Gearbox/Transmission", make: "Toyota", model: "Corolla", year_from: 2012, year_to: 2016, engine_code: "1NZ-FE", price_ttd: 4500, location: "Chaguanas", shot: "bench", transmission_type: "Automatic", featured: true, createdDaysAgo: 8, tested: true, note: "Automatic gearbox pulled from a 2014 Corolla. Shifts through the ranges on the bench." },
    { id: "p02", title: "Toyota Yaris 1NZ-FE Engine", dealer_id: "d_central", category: "Engine", make: "Toyota", model: "Yaris", year_from: 2008, year_to: 2016, engine_code: "1NZ-FE", price_ttd: 7800, location: "Chaguanas", shot: "engine", featured: true, createdDaysAgo: 7, tested: true, note: "1NZ-FE long motor for Yaris and Corolla. Compression checked and it turns freely." },
    { id: "p03", title: "Toyota Hilux 2KD Engine", dealer_id: "d_central", category: "Engine", make: "Toyota", model: "Hilux", year_from: 2006, year_to: 2015, engine_code: "2KD-FTV", price_ttd: 14500, location: "Chaguanas", shot: "engine", createdDaysAgo: 5, tested: true, note: "2KD-FTV diesel from a Hilux. Turns by hand. Injectors are still on the motor." },
    { id: "p04", title: "Toyota Hilux Tail Lights", dealer_id: "d_central", category: "Lights", make: "Toyota", model: "Hilux", year_from: 2012, year_to: 2015, price_ttd: 900, location: "Chaguanas", shot: "suv", transmission_type: "Unknown", createdDaysAgo: 4, tested: true, note: "Pair of Hilux tail lights. Lenses intact, plugs not cut." },
    { id: "p05", title: "2016 Toyota Axio Front Bumper", dealer_id: "d_central", category: "Body Parts", make: "Toyota", model: "Axio", year_from: 2012, year_to: 2016, price_ttd: 1600, location: "Chaguanas", shot: "body", transmission_type: "Unknown", createdDaysAgo: 11, tested: false, note: "Axio front bumper, mounting points straight. Colour is silver." },
    { id: "p06", title: "Toyota Corolla Front Shocks", dealer_id: "d_central", category: "Suspension", make: "Toyota", model: "Corolla", year_from: 2008, year_to: 2014, price_ttd: 700, location: "Chaguanas", shot: "shop", condition: "Used", transmission_type: "Unknown", negotiable: true, createdDaysAgo: 9, tested: false, note: "Pair of front shocks from a local Corolla. Bushes are the originals." },
    { id: "p07", title: "Toyota Yaris Headlights", dealer_id: "d_central", category: "Lights", make: "Toyota", model: "Yaris", year_from: 2011, year_to: 2016, price_ttd: 850, location: "Chaguanas", shot: "front", transmission_type: "Unknown", createdDaysAgo: 6, tested: true, note: "Pair of Yaris headlights, clear lenses, both plugs intact." },
    { id: "p08", title: "Honda Fit GE6 Gearbox", dealer_id: "d_central", category: "Gearbox/Transmission", make: "Honda", model: "Fit", year_from: 2010, year_to: 2013, price_ttd: 3200, location: "Chaguanas", shot: "bench", transmission_type: "Automatic", createdDaysAgo: 9, tested: true, note: "GE6 Fit automatic gearbox. Engages drive and reverse on the bench." },
    { id: "p40", title: "Toyota Corolla Steel Wheel", dealer_id: "d_central", category: "Wheels & Tyres", make: "Toyota", model: "Corolla", year_from: 2008, year_to: 2014, price_ttd: 250, location: "Chaguanas", shot: "wheel", transmission_type: "Unknown", createdDaysAgo: 3, tested: true, note: "15-inch steel wheel with a usable tyre. No bend in the rim." },
    { id: "p41", title: "Toyota Hilux Front Bumper", dealer_id: "d_central", category: "Body Parts", make: "Toyota", model: "Hilux", year_from: 2006, year_to: 2011, price_ttd: 1800, location: "Chaguanas", shot: "suv", condition: "Used", transmission_type: "Unknown", createdDaysAgo: 12, tested: false, note: "Hilux front bumper, locally used. Brackets are still on it." },
    { id: "p42", title: "Toyota Corolla Alternator", dealer_id: "d_central", category: "Electrical", make: "Toyota", model: "Corolla", year_from: 2008, year_to: 2014, engine_code: "1NZ-FE", price_ttd: 550, location: "Chaguanas", shot: "shop", transmission_type: "Unknown", createdDaysAgo: 10, tested: true, note: "Corolla alternator for the 1NZ. Bench-tested and charging." },
    { id: "p43", title: "Toyota Hilux Air Filter", dealer_id: "d_central", category: "Other", make: "Toyota", model: "Hilux", year_from: 2006, year_to: 2015, engine_code: "2KD-FTV", price_ttd: 180, location: "Chaguanas", shot: "detail", condition: "New", transmission_type: "Unknown", createdDaysAgo: 1, tested: true, note: "New air filter still in the box for a 2KD Hilux." },
    { id: "p15", title: "Toyota Yaris Rear Bumper", dealer_id: "d_central", category: "Body Parts", make: "Toyota", model: "Yaris", year_from: 2011, year_to: 2016, price_ttd: 850, location: "Chaguanas", shot: "body", transmission_type: "Unknown", status: "reserved", createdDaysAgo: 2, tested: true, note: "Yaris rear bumper. A buyer asked us to hold it until Saturday." },
    { id: "p44", title: "Honda Fit L15A Engine", dealer_id: "d_central", category: "Engine", make: "Honda", model: "Fit", year_from: 2008, year_to: 2013, engine_code: "L15A", price_ttd: 6800, location: "Chaguanas", shot: "engine", createdDaysAgo: 6, tested: true, note: "L15A engine from a Fit. Compression checked. Gearbox is not included." },
    { id: "p09", title: "Nissan Tiida HR15 Engine", dealer_id: "d_south", category: "Engine", make: "Nissan", model: "Tiida", year_from: 2006, year_to: 2012, engine_code: "HR15DE", price_ttd: 6500, location: "San Fernando", shot: "engine", featured: true, createdDaysAgo: 5, tested: true, note: "HR15DE engine from a Tiida. Turns by hand and has been compression tested." },
    { id: "p10", title: "Nissan AD Wagon Gearbox", dealer_id: "d_south", category: "Gearbox/Transmission", make: "Nissan", model: "AD Wagon", year_from: 2008, year_to: 2014, engine_code: "HR15DE", price_ttd: 2800, location: "San Fernando", shot: "bench", transmission_type: "Automatic", featured: true, createdDaysAgo: 13, tested: true, note: "AD Wagon automatic gearbox. Common fitment for the Wingroad too. Confirm the code when you message." },
    { id: "p11", title: "Nissan B15 Headlamp", dealer_id: "d_south", category: "Lights", make: "Nissan", model: "B15", year_from: 2000, year_to: 2005, price_ttd: 450, location: "San Fernando", shot: "light", condition: "Used", transmission_type: "Unknown", negotiable: true, createdDaysAgo: 18, tested: false, note: "Driver-side B15 headlamp. Lens has light haze. This is the B15, not the Tiida." },
    { id: "p12", title: "Nissan B15 Gearbox", dealer_id: "d_south", category: "Gearbox/Transmission", make: "Nissan", model: "B15", year_from: 2000, year_to: 2005, engine_code: "QG18DE", price_ttd: 2600, location: "San Fernando", shot: "bench", transmission_type: "Automatic", createdDaysAgo: 4, tested: true, note: "B15 automatic gearbox for the QG18. Engages on the bench." },
    { id: "p13", title: "Nissan Tiida Front Bumper", dealer_id: "d_south", category: "Body Parts", make: "Nissan", model: "Tiida", year_from: 2006, year_to: 2012, price_ttd: 1100, location: "San Fernando", shot: "front", transmission_type: "Unknown", createdDaysAgo: 3, tested: true, note: "Tiida C11 front bumper. Clips included, unpainted." },
    { id: "p14", title: "Nissan AD Wagon Radiator", dealer_id: "d_south", category: "Electrical", make: "Nissan", model: "AD Wagon", year_from: 2008, year_to: 2014, engine_code: "HR15DE", price_ttd: 600, location: "San Fernando", shot: "shop", transmission_type: "Unknown", createdDaysAgo: 7, tested: true, note: "AD Wagon radiator. Tanks are solid, no patchwork." },
    { id: "p17", title: "Nissan Tiida Front Seats", dealer_id: "d_south", category: "Interior", make: "Nissan", model: "Tiida", year_from: 2006, year_to: 2012, price_ttd: 800, location: "San Fernando", shot: "seat", transmission_type: "Unknown", createdDaysAgo: 6, tested: true, note: "Tiida front seats, cloth, rails included. No tears in the cushions." },
    { id: "p18", title: "Nissan B15 Starter", dealer_id: "d_south", category: "Electrical", make: "Nissan", model: "B15", year_from: 2000, year_to: 2005, engine_code: "QG18DE", price_ttd: 400, location: "San Fernando", shot: "shop", transmission_type: "Unknown", createdDaysAgo: 8, tested: true, note: "B15 starter motor. Bench-tested and it kicks." },
    { id: "p19", title: "Nissan AD Wagon Tail Light", dealer_id: "d_south", category: "Lights", make: "Nissan", model: "AD Wagon", year_from: 2008, year_to: 2014, price_ttd: 350, location: "San Fernando", shot: "light", transmission_type: "Unknown", negotiable: true, createdDaysAgo: 2, tested: true, note: "Passenger tail light for an AD Wagon. All bulbs present." },
    { id: "p20", title: "Nissan Tiida Steering Rack", dealer_id: "d_south", category: "Suspension", make: "Nissan", model: "Tiida", year_from: 2006, year_to: 2012, price_ttd: 900, location: "San Fernando", shot: "shop", condition: "Used", transmission_type: "Unknown", createdDaysAgo: 15, tested: false, note: "Tiida steering rack, sold as seen. No play we could feel, but inspect it before you pay." },
    { id: "p45", title: "Nissan B15 Lower Arms", dealer_id: "d_south", category: "Suspension", make: "Nissan", model: "B15", year_from: 2000, year_to: 2005, price_ttd: 480, location: "San Fernando", shot: "detail", transmission_type: "Unknown", negotiable: true, createdDaysAgo: 11, tested: false, note: "Pair of front lower arms for a B15. Bushes are the originals." },
    { id: "p46", title: "Nissan Tiida ECU", dealer_id: "d_south", category: "Electrical", make: "Nissan", model: "Tiida", year_from: 2006, year_to: 2012, engine_code: "HR15DE", price_ttd: 850, location: "San Fernando", shot: "detail", transmission_type: "Unknown", createdDaysAgo: 1, tested: true, note: "Tiida HR15 computer. Bring your immobiliser details when you message." },
    { id: "p51", title: "Nissan B15 Radiator", dealer_id: "d_south", category: "Electrical", make: "Nissan", model: "B15", year_from: 2000, year_to: 2005, engine_code: "QG18DE", price_ttd: 450, location: "San Fernando", shot: "shop", transmission_type: "Unknown", createdDaysAgo: 9, tested: true, note: "B15 radiator for the QG18. No patches on the tanks." },
    { id: "p16", title: "Honda Civic FD Driver Door", dealer_id: "d_east", category: "Body Parts", make: "Honda", model: "Civic", year_from: 2006, year_to: 2011, price_ttd: 1600, location: "Arima", shot: "body", condition: "Used", transmission_type: "Unknown", status: "sold", soldDaysAgo: 10, createdDaysAgo: 20, tested: true, note: "Civic FD driver door, glass and mirror included. Sold more than a week ago, so search hides it." },
    { id: "p21", title: "Suzuki Swift K12B Engine", dealer_id: "d_east", category: "Engine", make: "Suzuki", model: "Swift", year_from: 2011, year_to: 2017, engine_code: "K12B", price_ttd: 5200, location: "Arima", shot: "engine", expiresIn: 5, createdDaysAgo: 55, tested: true, note: "Swift K12B engine. This listing is close to the 60-day mark so the dealer can press Still available." },
    { id: "p22", title: "Kia Rio Headlamp", dealer_id: "d_east", category: "Lights", make: "Kia", model: "Rio", year_from: 2012, year_to: 2016, price_ttd: 500, location: "Arima", shot: "light", transmission_type: "Unknown", status: "sold", soldDaysAgo: 2, createdDaysAgo: 14, tested: true, note: "Rio driver headlamp. Marked sold two days ago, so it still shows with a sold badge." },
    { id: "p23", title: "Hyundai Elantra Gearbox", dealer_id: "d_east", category: "Gearbox/Transmission", make: "Hyundai", model: "Elantra", year_from: 2011, year_to: 2015, engine_code: "G4FC", price_ttd: 3600, location: "Arima", shot: "bench", transmission_type: "Automatic", createdDaysAgo: 12, tested: true, note: "Elantra automatic gearbox for the G4FC. Pulled from a running car." },
    { id: "p24", title: "Honda Civic Front Seats", dealer_id: "d_east", category: "Interior", make: "Honda", model: "Civic", year_from: 2006, year_to: 2011, price_ttd: 750, location: "Arima", shot: "seat", transmission_type: "Unknown", createdDaysAgo: 4, tested: true, note: "Civic FD front seats, cloth. Rails included." },
    { id: "p25", title: "Hyundai Tucson Bonnet", dealer_id: "d_east", category: "Body Parts", make: "Hyundai", model: "Tucson", year_from: 2016, year_to: 2020, price_ttd: 1800, location: "Arima", shot: "suv", transmission_type: "Unknown", createdDaysAgo: 2, tested: true, note: "Tucson bonnet, white, no filler. Latch included." },
    { id: "p26", title: "Kia Sportage Tail Light", dealer_id: "d_east", category: "Lights", make: "Kia", model: "Sportage", year_from: 2016, year_to: 2021, price_ttd: 650, location: "Arima", shot: "suv", transmission_type: "Unknown", createdDaysAgo: 1, tested: true, note: "Passenger tail light for a Sportage. All bulbs present." },
    { id: "p27", title: "Suzuki Swift Gearbox", dealer_id: "d_east", category: "Gearbox/Transmission", make: "Suzuki", model: "Swift", year_from: 2011, year_to: 2017, engine_code: "K12B", price_ttd: 2400, location: "Arima", shot: "bench", transmission_type: "Automatic", createdDaysAgo: 8, tested: true, note: "Swift automatic gearbox. Engages drive and reverse on the bench." },
    { id: "p28", title: "Hyundai Elantra Headlamp", dealer_id: "d_east", category: "Lights", make: "Hyundai", model: "Elantra", year_from: 2011, year_to: 2015, price_ttd: 700, location: "Arima", shot: "front", transmission_type: "Unknown", negotiable: true, createdDaysAgo: 6, tested: true, note: "Elantra driver headlamp. Lens is clear." },
    { id: "p29", title: "Kia Rio Radiator", dealer_id: "d_east", category: "Electrical", make: "Kia", model: "Rio", year_from: 2012, year_to: 2016, engine_code: "G4FA", price_ttd: 550, location: "Arima", shot: "shop", transmission_type: "Unknown", createdDaysAgo: 7, tested: true, note: "Rio radiator. Tanks are solid." },
    { id: "p30", title: "Suzuki Swift Front Bumper", dealer_id: "d_east", category: "Body Parts", make: "Suzuki", model: "Swift", year_from: 2011, year_to: 2017, price_ttd: 900, location: "Arima", shot: "front", condition: "Used", transmission_type: "Unknown", createdDaysAgo: 10, tested: false, note: "Swift front bumper, locally used. A scuff on the corner." },
    { id: "p31", title: "Honda Civic Lower Arm", dealer_id: "d_central", category: "Suspension", make: "Honda", model: "Civic", year_from: 2006, year_to: 2011, price_ttd: 420, location: "Chaguanas", shot: "detail", transmission_type: "Unknown", createdDaysAgo: 5, tested: true, note: "Civic FD front lower arm. Ball joint is still tight." },
    { id: "p32", title: "Suzuki Swift Brake Pads", dealer_id: "d_central", category: "Other", make: "Suzuki", model: "Swift", year_from: 2011, year_to: 2017, price_ttd: 280, location: "Chaguanas", shot: "detail", condition: "New", transmission_type: "Unknown", createdDaysAgo: 1, tested: true, note: "New front brake pads for a Swift, still sealed." },
    { id: "p33", title: "Hyundai Tucson Headlamp", dealer_id: "d_central", category: "Lights", make: "Hyundai", model: "Tucson", year_from: 2016, year_to: 2020, price_ttd: 800, location: "Chaguanas", shot: "suv", transmission_type: "Unknown", createdDaysAgo: 3, tested: true, note: "Tucson driver headlamp. Housing is intact." },
    { id: "p47", title: "Honda Fit Front Seats", dealer_id: "d_central", category: "Interior", make: "Honda", model: "Fit", year_from: 2008, year_to: 2013, price_ttd: 700, location: "Chaguanas", shot: "seat", transmission_type: "Unknown", createdDaysAgo: 4, tested: true, note: "Fit front seats, cloth. No tears." },
    { id: "p48", title: "Honda Civic Rear Bumper", dealer_id: "d_crown", category: "Body Parts", make: "Honda", model: "Civic", year_from: 2006, year_to: 2011, price_ttd: 1400, location: "Tobago", shot: "body", transmission_type: "Unknown", createdDaysAgo: 1, tested: false, note: "Civic rear bumper. Hidden until this sample yard is approved." },
    { id: "p49", title: "Suzuki Swift Driver Door", dealer_id: "d_crown", category: "Body Parts", make: "Suzuki", model: "Swift", year_from: 2011, year_to: 2017, price_ttd: 1100, location: "Tobago", shot: "front", condition: "Used", transmission_type: "Unknown", createdDaysAgo: 1, tested: false, note: "Swift driver door. Waiting on approval before buyers can see it." },
    { id: "p50", title: "Toyota Hilux Door Glass", dealer_id: "d_crown", category: "Body Parts", make: "Toyota", model: "Hilux", year_from: 2006, year_to: 2015, price_ttd: 400, location: "Tobago", shot: "detail", transmission_type: "Unknown", createdDaysAgo: 2, tested: true, note: "Hilux door glass. Hidden while the yard is pending." },
  ];

  const parts: Part[] = sampleRows.map((row) =>
    part({
      id: row.id,
      title: row.title,
      dealer_id: row.dealer_id,
      category: row.category,
      make: row.make,
      model: row.model,
      year_from: row.year_from,
      year_to: row.year_to,
      engine_code: row.engine_code ?? "",
      price_ttd: row.price_ttd,
      location: row.location,
      photos: [...photo[row.shot]],
      description: blurb(row.note, row.location, row.tested ?? true),
      created_at: daysFromNow(-(row.createdDaysAgo ?? 8), now()),
      ...(row.condition ? { condition: row.condition } : {}),
      transmission_type: row.transmission_type ?? (row.category === "Gearbox/Transmission" ? "Automatic" : "Unknown"),
      ...(row.negotiable ? { negotiable: true } : {}),
      ...(row.status ? { status: row.status } : {}),
      ...(row.soldDaysAgo ? { sold_at: daysFromNow(-row.soldDaysAgo, now()) } : {}),
      ...(row.featured ? { featured: true, featured_until: daysFromNow(6, now()) } : {}),
      ...(row.expiresIn ? { expires_at: daysFromNow(row.expiresIn, now()) } : {}),
    }),
  );

  const reviews: Review[] = [
    { id: "r1", dealer_id: "d_central", name: "Ravi S.", phone: "18685550111", rating: 5, comment: "Engine started on the first turn. Price was what they listed.", created_at: daysFromNow(-20, now()) },
    { id: "r2", dealer_id: "d_central", name: "Keisha M.", phone: "18685550112", rating: 4, comment: "Gearbox was as described. Yard is easy to find in Endeavour.", created_at: daysFromNow(-12, now()) },
    { id: "r3", dealer_id: "d_south", name: "Andre P.", phone: "18685550113", rating: 5, comment: "Big yard. They let me inspect the Note engine before I paid.", created_at: daysFromNow(-9, now()) },
    { id: "r4", dealer_id: "d_south", name: "Tricia L.", phone: "18685550114", rating: 3, comment: "Part was fine. I waited a bit on Saturday morning.", created_at: daysFromNow(-4, now()) },
  ];

  const requests: PartRequest[] = [
    {
      id: "req1",
      name: "Jason Ali",
      phone: "18685550121",
      make: "Toyota",
      model: "Axio",
      year: "2012",
      part: "Air-condition compressor",
      notes: "1NZ, the clutch still spins but it does not cool.",
      created_at: daysFromNow(-1, now()),
    },
  ];

  const payments: Payment[] = [
    {
      id: "pay_central",
      dealer_id: "d_central",
      plan: "pro",
      amount_ttd: 200,
      method: "bank_transfer",
      receipt_url: null,
      status: "paid",
      period_start: daysFromNow(-24, now()),
      period_end: daysFromNow(6, now()),
      kind: "subscription",
      part_id: null,
      extra_type: null,
      fulfillment: null,
      note: "Sample paid Pro subscription.",
      created_at: daysFromNow(-24, now()),
    },
    {
      id: "pay_east",
      dealer_id: "d_east",
      plan: "pro",
      amount_ttd: 200,
      method: "bank_transfer",
      receipt_url: "/ads/trini-tyre.svg",
      status: "pending",
      period_start: null,
      period_end: null,
      kind: "subscription",
      part_id: null,
      extra_type: null,
      fulfillment: null,
      note: "East Yard uploaded a receipt and is waiting for approval.",
      created_at: daysFromNow(-1, now()),
    },
  ];

  return {
    users,
    dealers,
    categories: categories.map((category, index) => ({
      id: `cat_${category.slug}`,
      name: category.name,
      slug: category.slug,
      seo_name: category.seoName,
      icon: category.icon,
      sort: index,
    })),
    makes: makes.map((make, index) => ({
      id: `make_${slugify(make.name)}`,
      name: make.name,
      slug: slugify(make.name),
      sort: index,
    })),
    models: makes.flatMap((make) =>
      make.models.map((model) => ({
        id: `model_${slugify(make.name)}_${slugify(model)}`,
        make: make.name,
        name: model,
      })),
    ),
    parts,
    payments,
    reviews,
    reports: [
      {
        id: "rep1",
        part_id: "p11",
        reason: "Wrong vehicle",
        details: "Buyer thinks this lamp is for the Tiida, not the B15. Sample report.",
        status: "open",
        created_at: daysFromNow(-1, now()),
      },
    ],
    leads: [
      { id: "l1", part_id: "p01", dealer_id: "d_central", type: "whatsapp", created_at: daysFromNow(-3, now()) },
      { id: "l2", part_id: "p02", dealer_id: "d_central", type: "call", created_at: daysFromNow(-2, now()) },
      { id: "l3", part_id: "p09", dealer_id: "d_south", type: "whatsapp", created_at: daysFromNow(-1, now()) },
    ],
    inquiries: [
      {
        id: "inq1",
        part_id: "p02",
        dealer_id: "d_central",
        name: "Melissa R.",
        phone: "18685550131",
        message: "Is the 1NZ still on the shelf? I can pass in Endeavour tomorrow morning.",
        read: false,
        created_at: daysFromNow(-1, now()),
      },
    ],
    requests,
    ads: [
      {
        id: "ad_home",
        title: "Trini Tyre Co. — new and used tyres",
        image: "/ads/trini-tyre.svg",
        link: "https://wa.me/18683224691",
        placement: "homepage",
        starts_at: daysFromNow(-7, now()),
        ends_at: daysFromNow(21, now()),
        active: true,
        impressions: 320,
        clicks: 18,
        advertiser: "Trini Tyre Co.",
        created_at: daysFromNow(-7, now()),
      },
      {
        id: "ad_search",
        title: "Trini Tyre Co. in search results",
        image: "/ads/trini-tyre.svg",
        link: "https://wa.me/18683224691",
        placement: "search_inline",
        starts_at: daysFromNow(-7, now()),
        ends_at: daysFromNow(21, now()),
        active: true,
        impressions: 140,
        clicks: 7,
        advertiser: "Trini Tyre Co.",
        created_at: daysFromNow(-7, now()),
      },
      {
        id: "ad_side",
        title: "Trini Tyre Co. sidebar",
        image: "/ads/trini-tyre.svg",
        link: "https://wa.me/18683224691",
        placement: "search_sidebar",
        starts_at: daysFromNow(-7, now()),
        ends_at: daysFromNow(21, now()),
        active: true,
        impressions: 90,
        clicks: 4,
        advertiser: "Trini Tyre Co.",
        created_at: daysFromNow(-7, now()),
      },
      {
        id: "ad_part",
        title: "Island Cover insurance",
        image: "/ads/island-cover.svg",
        link: `${process.env.NEXT_PUBLIC_SITE_URL || "https://all-auto-tt-bice.vercel.app"}/advertise`,
        placement: "part_page",
        starts_at: daysFromNow(-3, now()),
        ends_at: daysFromNow(27, now()),
        active: true,
        impressions: 60,
        clicks: 3,
        advertiser: "Island Cover",
        created_at: daysFromNow(-3, now()),
      },
    ],
    ad_events: [],
    spotlights: [
      {
        id: "spot1",
        dealer_id: "d_south",
        kind: "month",
        label: "Dealer of the Month",
        starts_at: daysFromNow(-5, now()),
        ends_at: daysFromNow(25, now()),
        created_at: daysFromNow(-5, now()),
      },
    ],
    emails: [],
  };
}
