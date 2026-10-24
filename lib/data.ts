import "server-only";

import { brand, featuredBoost, plans, siteUrl } from "@/lib/config";
import { daysFromNow, slugify } from "@/lib/format";
import { ActionError, commit, loadDb } from "@/lib/repo";
import {
  activeAds,
  activeListingCount,
  activeSpotlights,
  adminStats,
  applyMaintenance,
  listPart,
  publicPartBySlug,
  queryParts,
  recomputeRating,
  similarParts,
  uniqueSlug,
} from "@/lib/store/query";
import type {
  Ad,
  AdPlacement,
  DB,
  Dealer,
  ExtraType,
  Part,
  PartQuery,
  PartStatus,
  Payment,
  PlanId,
  Report,
  Review,
  Spotlight,
} from "@/lib/types";
import { canSeeRequestDetails, effectivePlan, listingCap, renewExpiry, toPublicDealer } from "@/lib/visibility";

export { ActionError };

export async function searchParts(query: PartQuery) {
  return queryParts(await loadDb(), query);
}

export async function getPublicPart(slug: string) {
  const db = await loadDb();
  const part = publicPartBySlug(db, slug);
  if (!part) return null;
  return { part, similar: similarParts(db, part), reviews: db.reviews.filter((review) => review.dealer_id === part.dealer.id) };
}

export async function getPartById(id: string) {
  const db = await loadDb();
  const part = db.parts.find((item) => item.id === id);
  return part ? listPart(db, part) : null;
}

export async function listDealerParts(dealerId: string) {
  const db = await loadDb();
  return db.parts
    .filter((part) => part.dealer_id === dealerId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((part) => listPart(db, part));
}

export async function getDealerBySlug(slug: string) {
  const db = await loadDb();
  const dealer = db.dealers.find((item) => item.slug === slug);
  if (!dealer) return null;
  return {
    dealer,
    publicDealer: toPublicDealer(dealer),
    parts: queryParts(db, { dealerId: dealer.id, pageSize: 48, sort: "newest" }).items,
    reviews: db.reviews.filter((review) => review.dealer_id === dealer.id),
  };
}

export async function listPublicDealers() {
  const db = await loadDb();
  return db.dealers
    .filter((dealer) => dealer.status === "approved")
    .map((dealer) => ({
      ...toPublicDealer(dealer),
      listings: queryParts(db, { dealerId: dealer.id, pageSize: 1 }).total,
    }))
    .sort((a, b) => a.business_name.localeCompare(b.business_name));
}

export async function getDealerForOwner(userId: string) {
  const db = await loadDb();
  return db.dealers.find((dealer) => dealer.owner_user_id === userId) ?? null;
}

export async function getUserById(id: string) {
  const db = await loadDb();
  return db.users.find((user) => user.id === id) ?? null;
}

export async function getUserByEmail(email: string) {
  const db = await loadDb();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getCatalog() {
  const db = await loadDb();
  return {
    categories: [...db.categories].sort((a, b) => a.sort - b.sort),
    makes: [...db.makes].sort((a, b) => a.sort - b.sort),
    models: [...db.models].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function homeData() {
  const db = await loadDb();
  const featured = queryParts(db, { sort: "recommended", pageSize: 12 }).items.filter((part) => part.featured_now).slice(0, 4);
  const latest = queryParts(db, { sort: "newest", pageSize: 8 }).items;
  const dealers = db.dealers.filter((dealer) => dealer.status === "approved").map((dealer) => toPublicDealer(dealer));
  const spots = activeSpotlights(db)
    .map((spot) => {
      const dealer = db.dealers.find((item) => item.id === spot.dealer_id && item.status === "approved");
      return dealer ? { ...spot, dealer: toPublicDealer(dealer) } : null;
    })
    .filter((spot) => spot !== null);
  return {
    featured,
    latest,
    dealers,
    spots,
    month: spots.find((spot) => spot.kind === "month") ?? null,
    ads: activeAds(db, "homepage"),
    partCount: queryParts(db, { pageSize: 1 }).total,
    dealerCount: dealers.length,
  };
}

export async function adsFor(placement: AdPlacement) {
  return activeAds(await loadDb(), placement);
}

export async function dealerDashboard(dealerId: string) {
  const db = await loadDb();
  const dealer = db.dealers.find((item) => item.id === dealerId);
  if (!dealer) throw new ActionError("Dealer not found.");
  const parts = db.parts.filter((part) => part.dealer_id === dealerId);
  const plan = effectivePlan(dealer);
  return {
    dealer,
    plan,
    limit: listingCap(plan),
    used: activeListingCount(db, dealerId),
    canSeeRequests: canSeeRequestDetails(dealer),
    parts: parts.sort((a, b) => b.created_at.localeCompare(a.created_at)).map((part) => listPart(db, part)),
    inquiries: db.inquiries.filter((item) => item.dealer_id === dealerId).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    requests: [...db.requests].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    payments: db.payments.filter((item) => item.dealer_id === dealerId).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    leads: {
      whatsapp: parts.reduce((sum, part) => sum + part.whatsapp_clicks, 0),
      calls: parts.reduce((sum, part) => sum + part.call_clicks, 0),
      forms: parts.reduce((sum, part) => sum + part.inquiry_count, 0),
      views: parts.reduce((sum, part) => sum + part.views, 0),
    },
  };
}

export async function listEverything() {
  const db = await loadDb();
  return {
    db,
    stats: adminStats(db),
    dealers: db.dealers.map((dealer) => ({
      ...dealer,
      listings: db.parts.filter((part) => part.dealer_id === dealer.id && part.status !== "removed").length,
    })),
    parts: db.parts.map((part) => listPart(db, part)),
    payments: db.payments,
    reports: db.reports,
    requests: db.requests,
    ads: db.ads,
    spotlights: db.spotlights,
    emails: db.emails,
  };
}

export async function arrivals(limit = 40) {
  return queryParts(await loadDb(), { sort: "newest", pageSize: limit }).items;
}

export async function sitemapEntries() {
  const db = await loadDb();
  return {
    parts: db.parts.filter((part) => publicPartBySlug(db, part.slug)).map((part) => part.slug),
    dealers: db.dealers.filter((dealer) => dealer.status === "approved").map((dealer) => dealer.slug),
    makes: db.makes.map((make) => make.slug),
    categories: db.categories,
  };
}

function assertDealer(db: DB, dealerId: string) {
  const dealer = db.dealers.find((item) => item.id === dealerId);
  if (!dealer || dealer.status === "removed") throw new ActionError("Dealer account not found.");
  if (dealer.status === "suspended") throw new ActionError("This account is suspended. You can't change listings.");
  return dealer;
}

function roomForListing(db: DB, dealer: Dealer) {
  const plan = effectivePlan(dealer);
  const cap = listingCap(plan);
  const used = activeListingCount(db, dealer.id);
  if (used >= cap) {
    const label = plans[plan].listings === null ? "unlimited" : String(plans[plan].listings);
    throw new ActionError(`The ${plans[plan].name} plan covers ${label} live listings. Upgrade, or mark a part sold or removed.`);
  }
}

export async function registerDealer(input: {
  user: { id: string; email: string; password_hash: string | null; name: string; phone: string };
  dealer: Omit<Dealer, "id" | "owner_user_id" | "slug" | "status" | "verified" | "plan" | "plan_expires_at" | "plan_reminder_for" | "rating_avg" | "rating_count" | "example" | "created_at">;
}) {
  return commit((db) => {
    if (db.users.some((user) => user.email.toLowerCase() === input.user.email.toLowerCase())) {
      throw new ActionError("An account with that email already exists.");
    }
    const slug = uniqueSlug(db.dealers.map((dealer) => dealer.slug), slugify(input.dealer.business_name));
    const user = {
      ...input.user,
      role: "dealer" as const,
      created_at: new Date().toISOString(),
    };
    const dealer: Dealer = {
      ...input.dealer,
      id: crypto.randomUUID(),
      owner_user_id: user.id,
      slug,
      status: "pending",
      verified: false,
      plan: "free",
      plan_expires_at: null,
      plan_reminder_for: null,
      rating_avg: 0,
      rating_count: 0,
      example: false,
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    db.dealers.push(dealer);
    db.emails.push({
      id: crypto.randomUUID(),
      to: process.env.ADMIN_EMAIL || brand.email,
      subject: `New dealer waiting: ${dealer.business_name}`,
      body: `${dealer.business_name} in ${dealer.region} signed up and is waiting for approval.\nContact: ${dealer.contact_name}, ${dealer.phone}, ${dealer.email}\n\nReview: ${siteUrl()}/admin/dealers`,
      kind: "dealer_signup",
      status: "queued",
      created_at: new Date().toISOString(),
    });
    return { user, dealer };
  });
}

export async function saveDealerProfile(dealerId: string, patch: Partial<Dealer>) {
  return commit((db) => {
    const dealer = assertDealer(db, dealerId);
    const allowed: (keyof Dealer)[] = [
      "business_name",
      "contact_name",
      "phone",
      "whatsapp",
      "email",
      "region",
      "address",
      "lat",
      "lng",
      "hours",
      "logo",
      "cover",
      "about",
      "registration_number",
    ];
    for (const key of allowed) {
      if (patch[key] !== undefined) {
        Object.assign(dealer, { [key]: patch[key] });
      }
    }
    if (patch.business_name) {
      dealer.slug = uniqueSlug(
        db.dealers.filter((item) => item.id !== dealer.id).map((item) => item.slug),
        slugify(patch.business_name),
      );
    }
    return dealer;
  });
}

export async function createPart(dealerId: string, input: Omit<Part, "id" | "slug" | "dealer_id" | "views" | "whatsapp_clicks" | "call_clicks" | "inquiry_count" | "example" | "created_at" | "updated_at" | "expiry_reminder_for" | "renewed_at">) {
  return commit((db) => insertPart(db, dealerId, input));
}

function insertPart(db: DB, dealerId: string, input: Omit<Part, "id" | "slug" | "dealer_id" | "views" | "whatsapp_clicks" | "call_clicks" | "inquiry_count" | "example" | "created_at" | "updated_at" | "expiry_reminder_for" | "renewed_at">) {
  const dealer = assertDealer(db, dealerId);
  if (input.status !== "sold" && input.status !== "removed") roomForListing(db, dealer);
  const now = new Date().toISOString();
  const part: Part = {
    ...input,
    id: crypto.randomUUID(),
    slug: uniqueSlug(db.parts.map((item) => item.slug), slugify(input.title)),
    dealer_id: dealerId,
    views: 0,
    whatsapp_clicks: 0,
    call_clicks: 0,
    inquiry_count: 0,
    example: false,
    expiry_reminder_for: null,
    renewed_at: null,
    created_at: now,
    updated_at: now,
    expires_at: input.expires_at || renewExpiry(),
  };
  db.parts.push(part);
  return part;
}

export async function updatePart(dealerId: string, partId: string, patch: Partial<Part>) {
  return commit((db) => {
    assertDealer(db, dealerId);
    const part = db.parts.find((item) => item.id === partId && item.dealer_id === dealerId);
    if (!part) throw new ActionError("Listing not found.");
    const wasInactive = part.status === "sold" || part.status === "removed";
    const nextStatus = patch.status ?? part.status;
    if (wasInactive && nextStatus !== "sold" && nextStatus !== "removed") {
      roomForListing(db, db.dealers.find((item) => item.id === dealerId)!);
    }
    Object.assign(part, patch, { updated_at: new Date().toISOString() });
    if (patch.title) {
      part.slug = uniqueSlug(
        db.parts.filter((item) => item.id !== part.id).map((item) => item.slug),
        slugify(patch.title),
      );
    }
    if (patch.status === "sold" && !part.sold_at) part.sold_at = new Date().toISOString();
    if (patch.status && patch.status !== "sold") part.sold_at = null;
    return part;
  });
}

export async function duplicatePart(dealerId: string, partId: string) {
  return commit((db) => {
    assertDealer(db, dealerId);
    const part = db.parts.find((item) => item.id === partId && item.dealer_id === dealerId);
    if (!part) throw new ActionError("Listing not found.");
    return insertPart(db, dealerId, {
      ...part,
      title: `${part.title} copy`,
      status: "available",
      featured: false,
      featured_until: null,
      sold_at: null,
      expires_at: renewExpiry(),
    });
  });
}

export async function importParts(
  dealerId: string,
  rows: Omit<Part, "id" | "slug" | "dealer_id" | "views" | "whatsapp_clicks" | "call_clicks" | "inquiry_count" | "example" | "created_at" | "updated_at" | "expiry_reminder_for" | "renewed_at">[],
) {
  return commit((db) => {
    const dealer = assertDealer(db, dealerId);
    const created: Part[] = [];
    const skipped: string[] = [];
    for (const row of rows) {
      const plan = effectivePlan(dealer);
      if (activeListingCount(db, dealerId) >= listingCap(plan)) {
        skipped.push(row.title);
        continue;
      }
      created.push(insertPart(db, dealerId, row));
    }
    return { created: created.length, skipped };
  });
}

export async function renewPart(dealerId: string, partId: string) {
  return commit((db) => {
    assertDealer(db, dealerId);
    const part = db.parts.find((item) => item.id === partId && item.dealer_id === dealerId);
    if (!part) throw new ActionError("Listing not found.");
    if (part.status === "removed" || part.status === "sold") {
      throw new ActionError("Sold or removed listings stay closed. Duplicate the listing if you have another one.");
    }
    part.expires_at = renewExpiry();
    part.renewed_at = new Date().toISOString();
    part.expiry_reminder_for = null;
    part.updated_at = part.renewed_at;
    return part;
  });
}

export async function setPartStatus(dealerId: string, partId: string, status: PartStatus) {
  return updatePart(dealerId, partId, { status });
}

export async function trackPart(partId: string, type: "view" | "whatsapp" | "call" | "form") {
  return commit((db) => {
    const part = db.parts.find((item) => item.id === partId);
    if (!part) return null;
    if (type === "view") part.views += 1;
    if (type === "whatsapp") part.whatsapp_clicks += 1;
    if (type === "call") part.call_clicks += 1;
    if (type === "form") part.inquiry_count += 1;
    if (type !== "view") {
      db.leads.push({
        id: crypto.randomUUID(),
        part_id: part.id,
        dealer_id: part.dealer_id,
        type,
        created_at: new Date().toISOString(),
      });
    }
    return part;
  });
}

export async function createInquiry(input: { partId: string; name: string; phone: string; message: string }) {
  return commit((db) => {
    const part = db.parts.find((item) => item.id === input.partId);
    const dealer = part ? db.dealers.find((item) => item.id === part.dealer_id) : undefined;
    if (!part || !dealer) throw new ActionError("That listing is no longer available.");
    part.inquiry_count += 1;
    const inquiry = {
      id: crypto.randomUUID(),
      part_id: part.id,
      dealer_id: dealer.id,
      name: input.name,
      phone: input.phone,
      message: input.message,
      read: false,
      created_at: new Date().toISOString(),
    };
    db.inquiries.push(inquiry);
    db.leads.push({ id: crypto.randomUUID(), part_id: part.id, dealer_id: dealer.id, type: "form", created_at: inquiry.created_at });
    if (dealer.email) {
      db.emails.push({
        id: crypto.randomUUID(),
        to: dealer.email,
        subject: `Inquiry: ${part.title}`,
        body: `${input.name} (${input.phone}) asked about ${part.title}:\n\n${input.message}`,
        kind: "inquiry",
        status: "queued",
        created_at: inquiry.created_at,
      });
    }
    return inquiry;
  });
}

export async function markInquiryRead(dealerId: string, inquiryId: string) {
  return commit((db) => {
    const inquiry = db.inquiries.find((item) => item.id === inquiryId && item.dealer_id === dealerId);
    if (inquiry) inquiry.read = true;
  });
}

export async function createReview(input: { dealerId: string; name: string; phone: string; rating: number; comment: string }) {
  return commit((db) => {
    const dealer = db.dealers.find((item) => item.id === input.dealerId && item.status === "approved");
    if (!dealer) throw new ActionError("Dealer not found.");
    const existing = db.reviews.find((review) => review.dealer_id === input.dealerId && review.phone === input.phone);
    if (existing) {
      existing.name = input.name;
      existing.rating = input.rating;
      existing.comment = input.comment;
      existing.created_at = new Date().toISOString();
      recomputeRating(db, input.dealerId);
      return existing;
    }
    const review: Review = {
      id: crypto.randomUUID(),
      dealer_id: input.dealerId,
      name: input.name,
      phone: input.phone,
      rating: input.rating,
      comment: input.comment,
      created_at: new Date().toISOString(),
    };
    db.reviews.push(review);
    recomputeRating(db, input.dealerId);
    return review;
  });
}

export async function createReport(input: { partId: string; reason: string; details: string }) {
  return commit((db) => {
    if (!db.parts.some((part) => part.id === input.partId)) throw new ActionError("Listing not found.");
    const report: Report = {
      id: crypto.randomUUID(),
      part_id: input.partId,
      reason: input.reason,
      details: input.details,
      status: "open",
      created_at: new Date().toISOString(),
    };
    db.reports.push(report);
    return report;
  });
}

export async function createRequest(input: { name: string; phone: string; make: string; model: string; year: string; part: string; notes: string }) {
  return commit((db) => {
    const request = { id: crypto.randomUUID(), ...input, created_at: new Date().toISOString() };
    db.requests.push(request);
    const dealerIds = new Set(db.parts.filter((part) => part.make === input.make).map((part) => part.dealer_id));
    for (const dealer of db.dealers) {
      if (dealer.status !== "approved" || !dealerIds.has(dealer.id) || !dealer.email) continue;
      const paid = canSeeRequestDetails(dealer);
      db.emails.push({
        id: crypto.randomUUID(),
        to: dealer.email,
        subject: `Part request: ${input.make} ${input.model} ${input.part}`,
        body: paid
          ? `${input.name} wants a ${input.year} ${input.make} ${input.model} ${input.part}.\nPhone: ${input.phone}\n${input.notes}\n\nReply on WhatsApp from your requests board.`
          : `A buyer wants a ${input.year} ${input.make} ${input.model} ${input.part}. Upgrade to Pro to see their phone number and reply.`,
        kind: "part_request",
        status: "queued",
        created_at: request.created_at,
      });
    }
    return request;
  });
}

export async function createPayment(input: Omit<Payment, "id" | "created_at" | "status" | "period_start" | "period_end" | "receipt_url" | "fulfillment"> & { note?: string }) {
  return commit((db) => {
    const payment: Payment = {
      ...input,
      note: input.note ?? "",
      id: crypto.randomUUID(),
      status: "pending",
      period_start: null,
      period_end: null,
      receipt_url: null,
      fulfillment: input.kind === "extra" ? "new" : null,
      created_at: new Date().toISOString(),
    };
    db.payments.push(payment);
    return payment;
  });
}

export async function attachReceipt(dealerId: string, paymentId: string, receiptUrl: string) {
  return commit((db) => {
    const payment = db.payments.find((item) => item.id === paymentId && item.dealer_id === dealerId);
    if (!payment) throw new ActionError("Payment not found.");
    if (payment.status === "paid") throw new ActionError("This payment is already marked paid.");
    payment.receipt_url = receiptUrl;
    payment.status = "pending";
    return payment;
  });
}

export async function setDealerStatus(dealerId: string, status: Dealer["status"], verified?: boolean) {
  return commit((db) => {
    const dealer = db.dealers.find((item) => item.id === dealerId);
    if (!dealer) throw new ActionError("Dealer not found.");
    const was = dealer.status;
    dealer.status = status;
    if (verified !== undefined) dealer.verified = verified;
    if (status === "approved" && was !== "approved" && dealer.email) {
      db.emails.push({
        id: crypto.randomUUID(),
        to: dealer.email,
        subject: `${dealer.business_name} is approved on ALL AUTO TT`,
        body: `Your dealer account is approved. Buyers can now see your storefront and listings.\n\nStorefront: ${siteUrl()}/dealers/${dealer.slug}`,
        kind: "dealer_approved",
        status: "queued",
        created_at: new Date().toISOString(),
      });
    }
    return dealer;
  });
}

export async function setDealerPlan(dealerId: string, plan: PlanId, expiresAt: string | null) {
  return commit((db) => {
    const dealer = db.dealers.find((item) => item.id === dealerId);
    if (!dealer) throw new ActionError("Dealer not found.");
    dealer.plan = plan;
    dealer.plan_expires_at = plan === "free" ? null : expiresAt;
    dealer.plan_reminder_for = null;
    return dealer;
  });
}

export async function decidePayment(paymentId: string, status: "paid" | "rejected") {
  return commit((db) => {
    const payment = db.payments.find((item) => item.id === paymentId);
    if (!payment) throw new ActionError("Payment not found.");
    payment.status = status;
    if (status !== "paid") return payment;
    const start = new Date().toISOString();
    payment.period_start = start;
    const dealer = db.dealers.find((item) => item.id === payment.dealer_id);
    if (payment.kind === "subscription" && dealer && (payment.plan === "pro" || payment.plan === "premium")) {
      payment.period_end = daysFromNow(30);
      dealer.plan = payment.plan;
      dealer.plan_expires_at = payment.period_end;
      dealer.plan_reminder_for = null;
    }
    if (payment.kind === "featured" && payment.part_id) {
      payment.period_end = daysFromNow(featuredBoost.days);
      const part = db.parts.find((item) => item.id === payment.part_id);
      if (part) {
        part.featured = true;
        part.featured_until = payment.period_end;
        part.updated_at = start;
      }
    }
    if (payment.kind === "extra") payment.fulfillment = payment.fulfillment ?? "new";
    return payment;
  });
}

export async function setFulfillment(paymentId: string, fulfillment: Payment["fulfillment"]) {
  return commit((db) => {
    const payment = db.payments.find((item) => item.id === paymentId);
    if (!payment) throw new ActionError("Order not found.");
    payment.fulfillment = fulfillment;
    return payment;
  });
}

export async function moderatePart(partId: string, status: PartStatus) {
  return commit((db) => {
    const part = db.parts.find((item) => item.id === partId);
    if (!part) throw new ActionError("Listing not found.");
    part.status = status;
    part.updated_at = new Date().toISOString();
    if (status === "sold") part.sold_at = part.sold_at ?? part.updated_at;
    return part;
  });
}

export async function setFeatured(partId: string, featured: boolean, days = featuredBoost.days) {
  return commit((db) => {
    const part = db.parts.find((item) => item.id === partId);
    if (!part) throw new ActionError("Listing not found.");
    part.featured = featured;
    part.featured_until = featured ? daysFromNow(days) : null;
    part.updated_at = new Date().toISOString();
    return part;
  });
}

export async function decideReport(reportId: string, status: "dismissed" | "actioned") {
  return commit((db) => {
    const report = db.reports.find((item) => item.id === reportId);
    if (!report) throw new ActionError("Report not found.");
    report.status = status;
    if (status === "actioned") {
      const part = db.parts.find((item) => item.id === report.part_id);
      if (part) {
        part.status = "removed";
        part.updated_at = new Date().toISOString();
      }
    }
    return report;
  });
}

export async function saveAd(ad: Omit<Ad, "id" | "impressions" | "clicks" | "created_at"> & { id?: string }) {
  return commit((db) => {
    if (ad.id) {
      const existing = db.ads.find((item) => item.id === ad.id);
      if (!existing) throw new ActionError("Ad not found.");
      Object.assign(existing, ad);
      return existing;
    }
    const created: Ad = {
      ...ad,
      id: crypto.randomUUID(),
      impressions: 0,
      clicks: 0,
      created_at: new Date().toISOString(),
    };
    db.ads.push(created);
    return created;
  });
}

export async function removeAd(id: string) {
  return commit((db) => {
    db.ads = db.ads.filter((ad) => ad.id !== id);
  });
}

export async function trackAd(id: string, type: "impression" | "click") {
  return commit((db) => {
    const ad = db.ads.find((item) => item.id === id);
    if (!ad) return null;
    if (type === "impression") ad.impressions += 1;
    if (type === "click") ad.clicks += 1;
    db.ad_events.push({ id: crypto.randomUUID(), ad_id: id, type, created_at: new Date().toISOString() });
    return ad;
  });
}

export async function saveSpotlight(input: Omit<Spotlight, "id" | "created_at"> & { id?: string }) {
  return commit((db) => {
    if (input.id) {
      const existing = db.spotlights.find((item) => item.id === input.id);
      if (!existing) throw new ActionError("Spotlight not found.");
      Object.assign(existing, input);
      return existing;
    }
    const created: Spotlight = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    db.spotlights.push(created);
    return created;
  });
}

export async function removeSpotlight(id: string) {
  return commit((db) => {
    db.spotlights = db.spotlights.filter((item) => item.id !== id);
  });
}

export async function saveCategory(input: { id?: string; name: string; slug: string; seo_name: string; icon: string }) {
  return commit((db) => {
    if (input.id) {
      const category = db.categories.find((item) => item.id === input.id);
      if (!category) throw new ActionError("Category not found.");
      const previous = category.name;
      Object.assign(category, input);
      if (previous !== input.name) {
        for (const part of db.parts) if (part.category === previous) part.category = input.name;
      }
      return category;
    }
    const created = { ...input, id: crypto.randomUUID(), sort: db.categories.length };
    db.categories.push(created);
    return created;
  });
}

export async function removeCategory(id: string) {
  return commit((db) => {
    const category = db.categories.find((item) => item.id === id);
    if (!category) return;
    if (db.parts.some((part) => part.category === category.name)) {
      throw new ActionError("Move listings out of this category before deleting it.");
    }
    db.categories = db.categories.filter((item) => item.id !== id);
  });
}

export async function saveMake(input: { id?: string; name: string; slug: string }) {
  return commit((db) => {
    if (input.id) {
      const make = db.makes.find((item) => item.id === input.id);
      if (!make) throw new ActionError("Make not found.");
      const previous = make.name;
      make.name = input.name;
      make.slug = input.slug;
      if (previous !== input.name) {
        for (const model of db.models) if (model.make === previous) model.make = input.name;
        for (const part of db.parts) if (part.make === previous) part.make = input.name;
        for (const request of db.requests) if (request.make === previous) request.make = input.name;
      }
      return make;
    }
    const created = { ...input, id: crypto.randomUUID(), sort: db.makes.length };
    db.makes.push(created);
    return created;
  });
}

export async function removeMake(id: string) {
  return commit((db) => {
    const make = db.makes.find((item) => item.id === id);
    if (!make) return;
    if (db.parts.some((part) => part.make === make.name)) throw new ActionError("Listings still use this make.");
    db.models = db.models.filter((model) => model.make !== make.name);
    db.makes = db.makes.filter((item) => item.id !== id);
  });
}

export async function saveModel(input: { id?: string; make: string; name: string }) {
  return commit((db) => {
    if (input.id) {
      const model = db.models.find((item) => item.id === input.id);
      if (!model) throw new ActionError("Model not found.");
      const previous = model.name;
      model.make = input.make;
      model.name = input.name;
      if (previous !== input.name) {
        for (const part of db.parts) if (part.make === model.make && part.model === previous) part.model = input.name;
      }
      return model;
    }
    const created = { ...input, id: crypto.randomUUID() };
    db.models.push(created);
    return created;
  });
}

export async function removeModel(id: string) {
  return commit((db) => {
    db.models = db.models.filter((model) => model.id !== id);
  });
}

export async function runMaintenance() {
  return commit((db) => applyMaintenance(db));
}

export async function markEmails(ids: string[], status: "sent" | "logged") {
  return commit((db) => {
    for (const email of db.emails) {
      if (ids.includes(email.id) && email.status === "queued") email.status = status;
    }
  });
}

export async function queuedEmails() {
  const db = await loadDb();
  return db.emails.filter((email) => email.status === "queued");
}

export function findDealerPart(dbDealerParts: Part[], id: string) {
  return dbDealerParts.find((part) => part.id === id) ?? null;
}

export type { ExtraType };
