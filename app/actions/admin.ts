"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { deliverQueuedEmails } from "@/lib/email";
import {
  decidePayment,
  decideReport,
  moderatePart,
  removeAd,
  removeCategory,
  removeMake,
  removeModel,
  removeSpotlight,
  runMaintenance,
  saveAd,
  saveCategory,
  saveMake,
  saveModel,
  saveSpotlight,
  setDealerPlan,
  setDealerStatus,
  setFeatured,
  setFulfillment,
} from "@/lib/data";
import { mutate } from "@/lib/mutate";
import { slugify } from "@/lib/format";
import { saveUpload } from "@/lib/uploads";
import type { AdPlacement, DealerStatus, PartStatus, PlanId } from "@/lib/types";

async function gate() {
  await requireAdmin();
}

function text(formData: FormData, key: string, max = 400) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

export async function dealerStatusAction(formData: FormData) {
  await gate();
  const id = text(formData, "id", 80);
  const status = text(formData, "status", 20) as DealerStatus;
  const verifiedRaw = formData.get("verified");
  const verified = verifiedRaw === "true" ? true : verifiedRaw === "false" ? false : undefined;
  const result = await mutate(() => setDealerStatus(id, status, verified));
  if (!result.ok) redirect(`/admin/dealers?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/dealers?ok=saved");
}

export async function dealerPlanAction(formData: FormData) {
  await gate();
  const id = text(formData, "id", 80);
  const plan = text(formData, "plan", 20) as PlanId;
  const expires = text(formData, "expires", 40);
  const iso = expires ? new Date(`${expires.slice(0, 10)}T12:00:00-04:00`).toISOString() : null;
  const result = await mutate(() => setDealerPlan(id, plan, Number.isNaN(Date.parse(iso ?? "")) ? null : iso));
  if (!result.ok) redirect(`/admin/dealers?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/dealers?ok=saved");
}

export async function paymentDecisionAction(formData: FormData) {
  await gate();
  const id = text(formData, "id", 80);
  const status = text(formData, "status", 20) === "paid" ? "paid" : "rejected";
  const result = await mutate(() => decidePayment(id, status));
  if (!result.ok) redirect(`/admin/payments?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/payments?ok=saved");
}

export async function fulfillmentAction(formData: FormData) {
  await gate();
  const id = text(formData, "id", 80);
  const fulfillment = text(formData, "fulfillment", 20) as "new" | "in_progress" | "done";
  const result = await mutate(() => setFulfillment(id, fulfillment));
  if (!result.ok) redirect(`/admin/payments?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/payments?ok=saved");
}

export async function listingStatusAction(formData: FormData) {
  await gate();
  const id = text(formData, "id", 80);
  const status = text(formData, "status", 20) as PartStatus;
  const result = await mutate(() => moderatePart(id, status));
  if (!result.ok) redirect(`/admin/listings?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/listings?ok=saved");
}

export async function featureAdminAction(formData: FormData) {
  await gate();
  const id = text(formData, "id", 80);
  const on = text(formData, "featured", 5) === "true";
  const result = await mutate(() => setFeatured(id, on));
  if (!result.ok) redirect(`/admin/listings?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/listings?ok=saved");
}

export async function reportDecisionAction(formData: FormData) {
  await gate();
  const id = text(formData, "id", 80);
  const status = text(formData, "status", 20) === "actioned" ? "actioned" : "dismissed";
  const result = await mutate(() => decideReport(id, status));
  if (!result.ok) redirect(`/admin/reports?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/reports?ok=saved");
}

export async function adAction(formData: FormData) {
  await gate();
  const placement = text(formData, "placement", 40) as AdPlacement;
  const starts = new Date(text(formData, "starts_at", 40));
  const ends = new Date(text(formData, "ends_at", 40));
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
    redirect("/admin/ads?error=Enter%20a%20start%20and%20end%20date.");
  }
  let image = text(formData, "image", 300);
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    try {
      image = await saveUpload(file, "ads");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      redirect(`/admin/ads?error=${encodeURIComponent(message)}`);
    }
  }
  const result = await mutate(() =>
    saveAd({
      id: text(formData, "id", 80) || undefined,
      title: text(formData, "title", 140),
      image,
      link: text(formData, "link", 300),
      placement,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      active: formData.get("active") === "on",
      advertiser: text(formData, "advertiser", 80),
    }),
  );
  if (!result.ok) redirect(`/admin/ads?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/ads?ok=saved");
}

export async function deleteAdAction(formData: FormData) {
  await gate();
  await mutate(() => removeAd(text(formData, "id", 80)));
  redirect("/admin/ads?ok=saved");
}

export async function spotlightAction(formData: FormData) {
  await gate();
  const kind = text(formData, "kind", 20) === "homepage" ? "homepage" : "month";
  const starts = new Date(text(formData, "starts_at", 40));
  const ends = new Date(text(formData, "ends_at", 40));
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
    redirect("/admin/spotlights?error=Enter%20a%20start%20and%20end%20date.");
  }
  const result = await mutate(() =>
    saveSpotlight({
      id: text(formData, "id", 80) || undefined,
      dealer_id: text(formData, "dealer_id", 80),
      kind,
      label: text(formData, "label", 80) || (kind === "month" ? "Dealer of the Month" : "Homepage spotlight"),
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
    }),
  );
  if (!result.ok) redirect(`/admin/spotlights?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/spotlights?ok=saved");
}

export async function deleteSpotlightAction(formData: FormData) {
  await gate();
  await mutate(() => removeSpotlight(text(formData, "id", 80)));
  redirect("/admin/spotlights?ok=saved");
}

export async function categoryAction(formData: FormData) {
  await gate();
  const name = text(formData, "name", 60);
  const result = await mutate(() =>
    saveCategory({
      id: text(formData, "id", 80) || undefined,
      name,
      slug: text(formData, "slug", 60) || slugify(name),
      seo_name: text(formData, "seo_name", 60) || name,
      icon: text(formData, "icon", 40) || "Package",
    }),
  );
  if (!result.ok) redirect(`/admin/catalog?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/catalog?ok=saved");
}

export async function deleteCategoryAction(formData: FormData) {
  await gate();
  const result = await mutate(() => removeCategory(text(formData, "id", 80)));
  if (!result.ok) redirect(`/admin/catalog?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/catalog?ok=saved");
}

export async function makeAction(formData: FormData) {
  await gate();
  const name = text(formData, "name", 40);
  const result = await mutate(() =>
    saveMake({ id: text(formData, "id", 80) || undefined, name, slug: slugify(name) }),
  );
  if (!result.ok) redirect(`/admin/catalog?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/catalog?ok=saved");
}

export async function deleteMakeAction(formData: FormData) {
  await gate();
  const result = await mutate(() => removeMake(text(formData, "id", 80)));
  if (!result.ok) redirect(`/admin/catalog?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/catalog?ok=saved");
}

export async function modelAction(formData: FormData) {
  await gate();
  const result = await mutate(() =>
    saveModel({
      id: text(formData, "id", 80) || undefined,
      make: text(formData, "make", 40),
      name: text(formData, "name", 40),
    }),
  );
  if (!result.ok) redirect(`/admin/catalog?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/catalog?ok=saved");
}

export async function deleteModelAction(formData: FormData) {
  await gate();
  await mutate(() => removeModel(text(formData, "id", 80)));
  redirect("/admin/catalog?ok=saved");
}

export async function remindAction() {
  await gate();
  await mutate(() => runMaintenance());
  redirect("/admin/emails?ok=saved");
}

export async function sendEmailAction() {
  await gate();
  await deliverQueuedEmails();
  redirect("/admin/emails?ok=saved");
}
