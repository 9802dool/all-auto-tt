"use server";

import { redirect } from "next/navigation";
import { extras, featuredBoost, plans, regions } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { digits } from "@/lib/format";
import { parseCsv } from "@/lib/csv";
import {
  attachReceipt,
  createPart,
  createPayment,
  duplicatePart,
  getDealerForOwner,
  importParts,
  markInquiryRead,
  renewPart,
  saveDealerProfile,
  setPartStatus,
  updatePart,
} from "@/lib/data";
import { mutate } from "@/lib/mutate";
import { regionPoint } from "@/lib/config";
import { saveUpload } from "@/lib/uploads";
import { renewExpiry } from "@/lib/visibility";
import type { FormState } from "@/app/actions/types";
import type { Part, PartStatus } from "@/lib/types";

async function shop() {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again." as const };
  const dealer = await getDealerForOwner(user.id);
  if (!dealer || dealer.status === "removed") return { error: "Create a dealer account first." as const };
  return { dealer };
}

function text(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function partInput(formData: FormData, photos: string[]): Omit<Part, "id" | "slug" | "dealer_id" | "views" | "whatsapp_clicks" | "call_clicks" | "inquiry_count" | "example" | "created_at" | "updated_at" | "expiry_reminder_for" | "renewed_at"> {
  const yearFrom = Number(text(formData, "year_from", 4));
  const yearTo = Number(text(formData, "year_to", 4));
  const price = Number(text(formData, "price_ttd", 12));
  const status = text(formData, "status", 20) as PartStatus;
  return {
    title: text(formData, "title", 140),
    category: text(formData, "category", 40),
    make: text(formData, "make", 40),
    model: text(formData, "model", 40),
    year_from: Number.isFinite(yearFrom) && yearFrom > 1980 ? yearFrom : null,
    year_to: Number.isFinite(yearTo) && yearTo > 1980 ? yearTo : null,
    engine_code: text(formData, "engine_code", 40),
    transmission_type: text(formData, "transmission_type", 40) || "Unknown",
    condition: text(formData, "condition", 40),
    price_ttd: Number.isFinite(price) ? Math.round(price) : NaN,
    negotiable: formData.get("negotiable") === "on",
    description: text(formData, "description", 2000),
    photos,
    location: text(formData, "location", 40),
    status: ["available", "reserved", "sold", "removed"].includes(status) ? status : "available",
    featured: false,
    featured_until: null,
    expires_at: renewExpiry(),
    sold_at: status === "sold" ? new Date().toISOString() : null,
  };
}

export async function savePartAction(_state: FormState, formData: FormData): Promise<FormState> {
  const session = await shop();
  if ("error" in session && !("dealer" in session)) return { error: session.error };
  const dealer = session.dealer;
  if (!dealer) return { error: "Create a dealer account first." };
  const existing = formData.getAll("existing_photo").map((value) => String(value)).filter((value) => value.startsWith("/") || value.startsWith("http"));
  const files = formData.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  const uploaded: string[] = [];
  for (const file of files.slice(0, 8)) {
    try {
      uploaded.push(await saveUpload(file, dealer.id));
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Photo upload failed." };
    }
  }
  const photos = [...existing, ...uploaded].slice(0, 8);
  const input = partInput(formData, photos);
  if (input.title.length < 4) return { error: "Give the part a clear title." };
  if (!input.category || !input.make) return { error: "Choose a category and make." };
  if (!Number.isFinite(input.price_ttd) || input.price_ttd < 0) return { error: "Enter a price in TTD." };
  if (!regions.some((region) => region.name === input.location)) return { error: "Choose a location." };
  if (!photos.length) return { error: "Add at least one photo." };
  const id = text(formData, "id", 80);
  if (id) {
    const { featured: _featured, featured_until: _until, expires_at: _expires, sold_at: _sold, ...patch } = input;
    const result = await mutate(() => updatePart(dealer.id, id, patch));
    if (!result.ok) return { error: result.error };
    redirect(`/dealer/parts/${id}/edit?ok=saved`);
  }
  const result = await mutate(() => createPart(dealer.id, input));
  if (!result.ok) return { error: result.error };
  redirect(`/dealer/parts/${result.data.id}/edit?ok=saved`);
}

export async function statusAction(formData: FormData) {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) redirect("/login?next=/dealer/parts");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as PartStatus;
  const result = await mutate(() => setPartStatus(session.dealer!.id, id, status));
  if (!result.ok) redirect(`/dealer/parts?error=${encodeURIComponent(result.error)}`);
  redirect("/dealer/parts?ok=status");
}

export async function renewAction(formData: FormData) {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) redirect("/login?next=/dealer/parts");
  const id = String(formData.get("id") ?? "");
  const result = await mutate(() => renewPart(session.dealer!.id, id));
  if (!result.ok) redirect(`/dealer/parts?error=${encodeURIComponent(result.error)}`);
  redirect("/dealer/parts?ok=renewed");
}

export async function duplicateAction(formData: FormData) {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) redirect("/login?next=/dealer/parts");
  const id = String(formData.get("id") ?? "");
  const result = await mutate(() => duplicatePart(session.dealer!.id, id));
  if (!result.ok) redirect(`/dealer/parts?error=${encodeURIComponent(result.error)}`);
  redirect(`/dealer/parts/${result.data.id}/edit?ok=saved`);
}

export async function importAction(_state: FormState, formData: FormData): Promise<FormState> {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) return { error: "Sign in again." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file." };
  const parsed = parseCsv(await file.text());
  if (parsed.errors.length) return { error: parsed.errors.slice(0, 6).join(" ") };
  if (!parsed.rows.length) return { error: "No listings found in the file." };
  const result = await mutate(() => importParts(session.dealer!.id, parsed.rows));
  if (!result.ok) return { error: result.error };
  const skipped = result.data.skipped.length ? ` Skipped ${result.data.skipped.length} because the plan limit was reached.` : "";
  redirect(`/dealer/parts?ok=imported&count=${result.data.created}&skipped=${result.data.skipped.length}${skipped ? "" : ""}`);
}

export async function readInquiryAction(formData: FormData) {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) redirect("/login");
  await markInquiryRead(session.dealer.id, String(formData.get("id") ?? ""));
  redirect("/dealer/inquiries?ok=saved");
}

export async function profileAction(formData: FormData) {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) redirect("/login?next=/dealer/settings");
  const region = text(formData, "region", 40);
  const point = regionPoint(region);
  if (!point) redirect("/dealer/settings?error=Choose%20a%20region.");
  let logo = session.dealer.logo;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      logo = await saveUpload(logoFile, "logos");
    } catch (error) {
      redirect(`/dealer/settings?error=${encodeURIComponent(error instanceof Error ? error.message : "Logo upload failed.")}`);
    }
  }
  let cover = session.dealer.cover;
  const coverFile = formData.get("cover");
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      cover = await saveUpload(coverFile, "covers");
    } catch (error) {
      redirect(`/dealer/settings?error=${encodeURIComponent(error instanceof Error ? error.message : "Cover upload failed.")}`);
    }
  }
  const result = await mutate(() =>
    saveDealerProfile(session.dealer!.id, {
      business_name: text(formData, "business_name", 120),
      contact_name: text(formData, "contact_name", 80),
      phone: digits(text(formData, "phone", 30)),
      whatsapp: digits(text(formData, "whatsapp", 30)),
      email: text(formData, "email", 160).toLowerCase(),
      region,
      address: text(formData, "address", 180),
      lat: point.lat,
      lng: point.lng,
      hours: text(formData, "hours", 120),
      about: text(formData, "about", 800),
      registration_number: text(formData, "registration_number", 40),
      logo,
      cover,
    }),
  );
  if (!result.ok) redirect(`/dealer/settings?error=${encodeURIComponent(result.error)}`);
  redirect("/dealer/settings?ok=saved");
}

export async function planCheckoutAction(formData: FormData) {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) redirect("/login?next=/dealer/billing");
  const plan = String(formData.get("plan") ?? "");
  if (plan !== "pro" && plan !== "premium") redirect("/dealer/billing?error=Choose%20Pro%20or%20Premium.");
  const result = await mutate(() =>
    createPayment({
      dealer_id: session.dealer!.id,
      plan,
      amount_ttd: plans[plan].price,
      method: "bank_transfer",
      kind: "subscription",
      part_id: null,
      extra_type: null,
      note: `${plans[plan].name} subscription`,
    }),
  );
  if (!result.ok) redirect(`/dealer/billing?error=${encodeURIComponent(result.error)}`);
  redirect(`/dealer/billing?ok=upgrade&payment=${result.data.id}`);
}

export async function featureCheckoutAction(formData: FormData) {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) redirect("/login?next=/dealer");
  const partId = String(formData.get("part_id") ?? "");
  const result = await mutate(() =>
    createPayment({
      dealer_id: session.dealer!.id,
      plan: "featured",
      amount_ttd: featuredBoost.price,
      method: "bank_transfer",
      kind: "featured",
      part_id: partId,
      extra_type: null,
      note: `Featured listing for ${featuredBoost.days} days`,
    }),
  );
  if (!result.ok) redirect(`/dealer/parts?error=${encodeURIComponent(result.error)}`);
  redirect(`/dealer/billing?ok=featured&payment=${result.data.id}`);
}

export async function extraCheckoutAction(formData: FormData) {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) redirect("/login?next=/dealer/extras");
  const extra = extras.find((item) => item.id === String(formData.get("extra") ?? ""));
  if (!extra) redirect("/dealer/extras?error=Choose%20a%20service.");
  const result = await mutate(() =>
    createPayment({
      dealer_id: session.dealer!.id,
      plan: extra.id,
      amount_ttd: extra.price,
      method: "bank_transfer",
      kind: "extra",
      part_id: null,
      extra_type: extra.id,
      note: extra.name,
    }),
  );
  if (!result.ok) redirect(`/dealer/extras?error=${encodeURIComponent(result.error)}`);
  redirect(`/dealer/billing?ok=extra&payment=${result.data.id}`);
}

export async function receiptAction(_state: FormState, formData: FormData): Promise<FormState> {
  const session = await shop();
  if (!("dealer" in session) || !session.dealer) return { error: "Sign in again." };
  const paymentId = text(formData, "payment_id", 80);
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) return { error: "Upload the transfer receipt." };
  try {
    const url = await saveUpload(file, "receipts");
    const result = await mutate(() => attachReceipt(session.dealer!.id, paymentId, url));
    if (!result.ok) return { error: result.error };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }
  redirect("/dealer/billing?ok=receipt");
}
