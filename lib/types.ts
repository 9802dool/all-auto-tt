export type Role = "admin" | "dealer";
export type PlanId = "free" | "pro" | "premium";
export type DealerStatus = "pending" | "approved" | "suspended" | "removed";
export type PartStatus = "available" | "reserved" | "sold" | "removed";
export type LeadType = "whatsapp" | "call" | "form";
export type PaymentKind = "subscription" | "featured" | "extra";
export type PaymentStatus = "pending" | "paid" | "rejected";
export type PaymentMethod = "bank_transfer" | "wipay";
export type ExtraType = "upload_stock" | "photo_service";
export type Fulfillment = "new" | "in_progress" | "done";
export type AdPlacement = "homepage" | "search_sidebar" | "search_inline" | "part_page";
export type SortKey = "recommended" | "newest" | "price_asc" | "price_desc";

export type User = {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  phone: string;
  role: Role;
  created_at: string;
};

export type Dealer = {
  id: string;
  owner_user_id: string | null;
  business_name: string;
  slug: string;
  contact_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  region: string;
  address: string;
  lat: number | null;
  lng: number | null;
  hours: string;
  logo: string | null;
  cover: string | null;
  about: string;
  registration_number: string;
  status: DealerStatus;
  verified: boolean;
  plan: PlanId;
  plan_expires_at: string | null;
  plan_reminder_for: string | null;
  rating_avg: number;
  rating_count: number;
  example: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  seo_name: string;
  icon: string;
  sort: number;
};

export type Make = {
  id: string;
  name: string;
  slug: string;
  sort: number;
};

export type VehicleModel = {
  id: string;
  make: string;
  name: string;
};

export type Part = {
  id: string;
  title: string;
  slug: string;
  category: string;
  make: string;
  model: string;
  year_from: number | null;
  year_to: number | null;
  engine_code: string;
  transmission_type: string;
  condition: string;
  price_ttd: number;
  negotiable: boolean;
  description: string;
  photos: string[];
  location: string;
  status: PartStatus;
  featured: boolean;
  featured_until: string | null;
  dealer_id: string;
  views: number;
  whatsapp_clicks: number;
  call_clicks: number;
  inquiry_count: number;
  expires_at: string;
  sold_at: string | null;
  renewed_at: string | null;
  expiry_reminder_for: string | null;
  example: boolean;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  dealer_id: string;
  plan: string;
  amount_ttd: number;
  method: PaymentMethod;
  receipt_url: string | null;
  status: PaymentStatus;
  period_start: string | null;
  period_end: string | null;
  kind: PaymentKind;
  part_id: string | null;
  extra_type: ExtraType | null;
  fulfillment: Fulfillment | null;
  note: string;
  created_at: string;
};

export type Review = {
  id: string;
  dealer_id: string;
  name: string;
  phone: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Report = {
  id: string;
  part_id: string;
  reason: string;
  details: string;
  status: "open" | "dismissed" | "actioned";
  created_at: string;
};

export type Lead = {
  id: string;
  part_id: string;
  dealer_id: string;
  type: LeadType;
  created_at: string;
};

export type Inquiry = {
  id: string;
  part_id: string;
  dealer_id: string;
  name: string;
  phone: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type PartRequest = {
  id: string;
  name: string;
  phone: string;
  make: string;
  model: string;
  year: string;
  part: string;
  notes: string;
  created_at: string;
};

export type Ad = {
  id: string;
  title: string;
  image: string;
  link: string;
  placement: AdPlacement;
  starts_at: string;
  ends_at: string;
  active: boolean;
  impressions: number;
  clicks: number;
  advertiser: string;
  created_at: string;
};

export type AdEvent = {
  id: string;
  ad_id: string;
  type: "impression" | "click";
  created_at: string;
};

export type Spotlight = {
  id: string;
  dealer_id: string;
  kind: "month" | "homepage";
  label: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
};

export type EmailMessage = {
  id: string;
  to: string;
  subject: string;
  body: string;
  kind: string;
  status: "queued" | "sent" | "logged";
  created_at: string;
};

export type DB = {
  users: User[];
  dealers: Dealer[];
  categories: Category[];
  makes: Make[];
  models: VehicleModel[];
  parts: Part[];
  payments: Payment[];
  reviews: Review[];
  reports: Report[];
  leads: Lead[];
  inquiries: Inquiry[];
  requests: PartRequest[];
  ads: Ad[];
  ad_events: AdEvent[];
  spotlights: Spotlight[];
  emails: EmailMessage[];
};

export type PartQuery = {
  make?: string;
  model?: string;
  year?: number;
  category?: string;
  condition?: string;
  location?: string;
  min?: number;
  max?: number;
  q?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
  dealerId?: string;
  status?: PartStatus;
  includeHidden?: boolean;
};

export type PublicDealer = {
  id: string;
  business_name: string;
  slug: string;
  contact_name: string;
  phone: string;
  whatsapp: string;
  region: string;
  address: string;
  lat: number | null;
  lng: number | null;
  hours: string;
  logo: string | null;
  cover: string | null;
  about: string;
  status: DealerStatus;
  verified: boolean;
  plan: PlanId;
  rating_avg: number;
  rating_count: number;
  example: boolean;
};

export type ListedPart = Part & {
  dealer: PublicDealer;
  featured_now: boolean;
  expired: boolean;
  sold_hidden: boolean;
};
