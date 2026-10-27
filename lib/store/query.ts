import { pageSize, siteUrl } from "@/lib/config";
import { daysFromNow } from "@/lib/format";
import { matchesKeywords, sameText } from "@/lib/search";
import type { AdPlacement, DB, Dealer, EmailMessage, ListedPart, Part, PartQuery, SortKey } from "@/lib/types";
import { isExpired, isFeatured, isPublicPart, isSoldHidden, planRank, toPublicDealer } from "@/lib/visibility";

export function dealerMap(db: DB) {
  return new Map(db.dealers.map((dealer) => [dealer.id, dealer]));
}

export function listPart(db: DB, part: Part, now = Date.now()): ListedPart {
  const dealer = dealerMap(db).get(part.dealer_id);
  if (!dealer) {
    throw new Error(`Part ${part.id} is missing its dealer.`);
  }
  return {
    ...part,
    dealer: toPublicDealer(dealer, now),
    featured_now: isFeatured(part, now),
    expired: isExpired(part, now),
    sold_hidden: isSoldHidden(part, now),
  };
}

export function queryParts(db: DB, query: PartQuery, now = Date.now()) {
  const dealers = dealerMap(db);
  const filtered = db.parts.filter((part) => {
    const dealer = dealers.get(part.dealer_id);
    if (query.dealerId && part.dealer_id !== query.dealerId) return false;
    if (!query.includeHidden && !isPublicPart(part, dealer, now)) return false;
    if (query.status && part.status !== query.status) return false;
    if (query.make && !sameText(part.make, query.make)) return false;
    if (query.model && !sameText(part.model, query.model)) return false;
    if (query.category && part.category !== query.category) return false;
    if (query.condition && part.condition !== query.condition) return false;
    if (query.location && part.location !== query.location) return false;
    if (query.year) {
      const from = part.year_from ?? query.year;
      const to = part.year_to ?? query.year;
      if (query.year < from || query.year > to) return false;
    }
    if (query.min != null && part.price_ttd < query.min) return false;
    if (query.max != null && part.price_ttd > query.max) return false;
    if (query.q && !matchesKeywords(part, query.q)) return false;
    return true;
  });

  const sort: SortKey = query.sort ?? "recommended";
  filtered.sort((a, b) => compareParts(a, b, sort, dealers, now));

  const size = query.pageSize ?? pageSize;
  const page = Math.max(1, query.page ?? 1);
  const start = (page - 1) * size;
  return {
    items: filtered.slice(start, start + size).map((part) => listPart(db, part, now)),
    total: filtered.length,
    page,
    pageSize: size,
  };
}

function compareParts(
  a: Part,
  b: Part,
  sort: SortKey,
  dealers: Map<string, Dealer>,
  now: number,
) {
  if (sort === "price_asc") return a.price_ttd - b.price_ttd || b.created_at.localeCompare(a.created_at);
  if (sort === "price_desc") return b.price_ttd - a.price_ttd || b.created_at.localeCompare(a.created_at);
  if (sort === "newest") return b.created_at.localeCompare(a.created_at);
  const featured = Number(isFeatured(b, now)) - Number(isFeatured(a, now));
  if (featured) return featured;
  const rank = planRank(dealers.get(a.dealer_id), now) - planRank(dealers.get(b.dealer_id), now);
  if (rank) return rank;
  return b.created_at.localeCompare(a.created_at);
}

export function publicPartBySlug(db: DB, slug: string, now = Date.now()) {
  const part = db.parts.find((item) => item.slug === slug);
  if (!part) return null;
  const dealer = dealerMap(db).get(part.dealer_id);
  if (!isPublicPart(part, dealer, now)) return null;
  return listPart(db, part, now);
}

export function similarParts(db: DB, part: Part, now = Date.now()) {
  const same = queryParts(
    db,
    { make: part.make, category: part.category, pageSize: 8, sort: "recommended" },
    now,
  ).items.filter((item) => item.id !== part.id);
  if (same.length >= 4) return same.slice(0, 4);
  const makeOnly = queryParts(db, { make: part.make, pageSize: 8, sort: "newest" }, now).items.filter(
    (item) => item.id !== part.id && !same.some((picked) => picked.id === item.id),
  );
  return [...same, ...makeOnly].slice(0, 4);
}

export function activeAds(db: DB, placement: AdPlacement, now = Date.now()) {
  return db.ads.filter((ad) => {
    if (!ad.active || ad.placement !== placement) return false;
    return new Date(ad.starts_at).getTime() <= now && new Date(ad.ends_at).getTime() >= now;
  });
}

export function activeSpotlights(db: DB, now = Date.now()) {
  return db.spotlights.filter(
    (spot) => new Date(spot.starts_at).getTime() <= now && new Date(spot.ends_at).getTime() >= now,
  );
}

export function recomputeRating(db: DB, dealerId: string) {
  const dealer = db.dealers.find((item) => item.id === dealerId);
  if (!dealer) return;
  const reviews = db.reviews.filter((review) => review.dealer_id === dealerId);
  dealer.rating_count = reviews.length;
  dealer.rating_avg = reviews.length
    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
    : 0;
}

export function uniqueSlug(existing: string[], base: string) {
  const root = base || "item";
  if (!existing.includes(root)) return root;
  let n = 2;
  while (existing.includes(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

export function applyMaintenance(db: DB, now = Date.now()) {
  const created: EmailMessage[] = [];
  for (const part of db.parts) {
    if (part.status === "sold" || part.status === "removed") continue;
    const dealer = db.dealers.find((item) => item.id === part.dealer_id);
    if (!dealer?.email) continue;
    const days = (new Date(part.expires_at).getTime() - now) / 86_400_000;
    if (days > 7 || part.expiry_reminder_for === part.expires_at) continue;
    const expired = days <= 0;
    const email: EmailMessage = {
      id: `mail_${part.id}_${Math.round(new Date(part.expires_at).getTime())}`,
      to: dealer.email,
      subject: expired
        ? `Listing expired: ${part.title}`
        : `Still available? ${part.title} expires soon`,
      body: expired
        ? `Your listing "${part.title}" expired and is hidden from search. Open the dealer dashboard and press Still available to bring it back for another 60 days.\n\n${siteUrl()}/dealer/parts`
        : `Your listing "${part.title}" expires on ${part.expires_at.slice(0, 10)} and will drop off search. If it is still on the shelf, press Still available in your dashboard.\n\n${siteUrl()}/parts/${part.slug}`,
      kind: expired ? "listing_expired" : "listing_expiry",
      status: "queued",
      created_at: new Date(now).toISOString(),
    };
    if (!db.emails.some((item) => item.id === email.id)) {
      db.emails.push(email);
      created.push(email);
    }
    part.expiry_reminder_for = part.expires_at;
  }

  for (const dealer of db.dealers) {
    if (!dealer.plan_expires_at || !dealer.email) continue;
    if (dealer.plan === "free") continue;
    const days = (new Date(dealer.plan_expires_at).getTime() - now) / 86_400_000;
    if (days > 7 || dealer.plan_reminder_for === dealer.plan_expires_at) continue;
    const email: EmailMessage = {
      id: `mail_plan_${dealer.id}_${Math.round(new Date(dealer.plan_expires_at).getTime())}`,
      to: dealer.email,
      subject: `Renew your ALL AUTO TT ${dealer.plan} plan`,
      body: `Your ${dealer.plan} plan for ${dealer.business_name} ends on ${dealer.plan_expires_at.slice(0, 10)}. Transfer the renewal and upload the receipt so the listing limit and badge stay on.\n\n${siteUrl()}/dealer/billing`,
      kind: "plan_renewal",
      status: "queued",
      created_at: new Date(now).toISOString(),
    };
    if (!db.emails.some((item) => item.id === email.id)) {
      db.emails.push(email);
      created.push(email);
    }
    dealer.plan_reminder_for = dealer.plan_expires_at;
  }

  return { created, nextCheck: daysFromNow(1, now) };
}

export function adminStats(db: DB) {
  const paid = db.payments.filter((payment) => payment.status === "paid");
  return {
    dealers: db.dealers.filter((dealer) => dealer.status !== "removed").length,
    pendingDealers: db.dealers.filter((dealer) => dealer.status === "pending").length,
    approvedDealers: db.dealers.filter((dealer) => dealer.status === "approved").length,
    listings: db.parts.filter((part) => part.status !== "removed").length,
    available: db.parts.filter((part) => part.status === "available").length,
    leads: db.leads.length,
    whatsappLeads: db.leads.filter((lead) => lead.type === "whatsapp").length,
    callLeads: db.leads.filter((lead) => lead.type === "call").length,
    formLeads: db.leads.filter((lead) => lead.type === "form").length,
    inquiries: db.inquiries.length,
    requests: db.requests.length,
    openReports: db.reports.filter((report) => report.status === "open").length,
    revenue: paid.reduce((sum, payment) => sum + payment.amount_ttd, 0),
    views: db.parts.reduce((sum, part) => sum + part.views, 0),
  };
}

export function activeListingCount(db: DB, dealerId: string) {
  return db.parts.filter(
    (part) => part.dealer_id === dealerId && part.status !== "sold" && part.status !== "removed",
  ).length;
}
