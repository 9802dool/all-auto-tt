import { listingLifetimeDays, plans, soldVisibleDays } from "@/lib/config";
import type { Dealer, Part, PlanId, PublicDealer } from "@/lib/types";

export function effectivePlan(dealer: Pick<Dealer, "plan" | "plan_expires_at">, now = Date.now()): PlanId {
  if (dealer.plan === "free") return "free";
  if (!dealer.plan_expires_at) return dealer.plan;
  return new Date(dealer.plan_expires_at).getTime() > now ? dealer.plan : "free";
}

export function showsVerifiedBadge(dealer: Pick<Dealer, "verified" | "plan" | "plan_expires_at">, now = Date.now()) {
  if (dealer.verified) return true;
  const plan = effectivePlan(dealer, now);
  return plan === "pro" || plan === "premium";
}

export function listingCap(plan: PlanId) {
  const cap = plans[plan].listings;
  return cap === null ? Number.POSITIVE_INFINITY : cap;
}

export function canSeeRequestDetails(dealer: Pick<Dealer, "plan" | "plan_expires_at">, now = Date.now()) {
  const plan = effectivePlan(dealer, now);
  return plan === "pro" || plan === "premium";
}

export function isFeatured(part: Pick<Part, "featured" | "featured_until">, now = Date.now()) {
  if (!part.featured) return false;
  if (!part.featured_until) return true;
  return new Date(part.featured_until).getTime() > now;
}

export function isExpired(part: Pick<Part, "status" | "expires_at">, now = Date.now()) {
  if (part.status === "sold" || part.status === "removed") return false;
  return new Date(part.expires_at).getTime() <= now;
}

export function isSoldHidden(part: Pick<Part, "status" | "sold_at">, now = Date.now()) {
  if (part.status !== "sold" || !part.sold_at) return false;
  return now - new Date(part.sold_at).getTime() > soldVisibleDays * 86_400_000;
}

export function isPublicPart(part: Part, dealer: Dealer | undefined, now = Date.now()) {
  if (!dealer || dealer.status !== "approved") return false;
  if (part.status === "removed") return false;
  if (isExpired(part, now)) return false;
  if (isSoldHidden(part, now)) return false;
  return part.status === "available" || part.status === "reserved" || part.status === "sold";
}

export function planRank(dealer: Dealer | undefined, now = Date.now()) {
  const plan = dealer ? effectivePlan(dealer, now) : "free";
  if (plan === "premium") return 0;
  if (plan === "pro") return 1;
  return 2;
}

export function toPublicDealer(dealer: Dealer, now = Date.now()): PublicDealer {
  return {
    id: dealer.id,
    business_name: dealer.business_name,
    slug: dealer.slug,
    contact_name: dealer.contact_name,
    phone: dealer.phone,
    whatsapp: dealer.whatsapp,
    region: dealer.region,
    address: dealer.address,
    lat: dealer.lat,
    lng: dealer.lng,
    hours: dealer.hours,
    logo: dealer.logo,
    cover: dealer.cover,
    about: dealer.about,
    status: dealer.status,
    verified: showsVerifiedBadge(dealer, now),
    plan: effectivePlan(dealer, now),
    rating_avg: dealer.rating_avg,
    rating_count: dealer.rating_count,
    example: dealer.example,
  };
}

export function renewExpiry(from = Date.now()) {
  return new Date(from + listingLifetimeDays * 86_400_000).toISOString();
}
