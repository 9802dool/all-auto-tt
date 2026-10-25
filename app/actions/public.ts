"use server";

import { redirect } from "next/navigation";
import { hashPassword, setSession, verifyPassword, clearSession } from "@/lib/auth";
import { digits, safeNext } from "@/lib/format";
import { regionPoint, reportReasons } from "@/lib/config";
import { createInquiry, createReport, createRequest, createReview, getDealerForOwner, getUserByEmail, registerDealer } from "@/lib/data";
import { mutate } from "@/lib/mutate";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { saveUpload } from "@/lib/uploads";
import type { FormState } from "@/app/actions/types";

function text(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

export async function loginAction(formData: FormData) {
  const email = text(formData, "email", 160).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(text(formData, "next", 200) || "/dealer");
  if (!email || !password) redirect("/login?error=Enter%20your%20email%20and%20password.");

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
    redirect(next);
  }

  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    redirect("/login?error=Email%20or%20password%20is%20wrong.");
  }
  await setSession(user.id);
  if (user.role === "admin") redirect(next.startsWith("/admin") ? next : "/admin");
  redirect(next.startsWith("/admin") ? "/dealer" : next);
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    await supabase?.auth.signOut();
  }
  await clearSession();
  redirect("/?ok=signedout");
}

export async function signupAction(_state: FormState, formData: FormData): Promise<FormState> {
  const business = text(formData, "business_name", 120);
  const contact = text(formData, "contact_name", 80);
  const phone = digits(text(formData, "phone", 30));
  const whatsapp = digits(text(formData, "whatsapp", 30) || phone);
  const email = text(formData, "email", 160).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const region = text(formData, "region", 40);
  const address = text(formData, "address", 180);
  const hours = text(formData, "hours", 120);
  const about = text(formData, "about", 800);
  const registration = text(formData, "registration_number", 40);
  const point = regionPoint(region);
  if (business.length < 2) return { error: "Enter the business name." };
  if (contact.length < 2) return { error: "Enter a contact person." };
  if (phone.length < 11) return { error: "Enter a Trinidad & Tobago phone number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (!point) return { error: "Choose a region." };
  if (address.length < 4) return { error: "Enter the business address." };

  let logo: string | null = null;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      logo = await saveUpload(logoFile, "logos");
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Logo upload failed." };
    }
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase!.auth.signUp({ email, password, options: { data: { name: contact, phone } } });
    if (error) {
      console.error("[signup] Supabase auth.signUp error:", error);
      return { error: error.message };
    }
    if (!data.user) return { error: "Check your email to confirm the account, then sign in." };
    const result = await mutate(() =>
      registerDealer({
        user: { id: data.user!.id, email, password_hash: null, name: contact, phone },
        dealer: {
          business_name: business,
          contact_name: contact,
          phone,
          whatsapp,
          email,
          region,
          address,
          lat: point.lat,
          lng: point.lng,
          hours: hours || "Mon–Sat 8:00am–4:00pm",
          logo,
          cover: null,
          about,
          registration_number: registration,
        },
      }),
    );
    if (!result.ok) {
      console.error("[signup] registerDealer error:", result.error);
      return { error: result.error };
    }
    if (!data.session) return { error: "Account created. Confirm the email, then sign in. The shop stays pending until approval." };
    redirect("/dealer?ok=joined");
  }

  const result = await mutate(() =>
    registerDealer({
      user: { id: crypto.randomUUID(), email, password_hash: hashPassword(password), name: contact, phone },
      dealer: {
        business_name: business,
        contact_name: contact,
        phone,
        whatsapp,
        email,
        region,
        address,
        lat: point.lat,
        lng: point.lng,
        hours: hours || "Mon–Sat 8:00am–4:00pm",
        logo,
        cover: null,
        about,
        registration_number: registration,
      },
    }),
  );
  if (!result.ok) return { error: result.error };
  await setSession(result.data.user.id);
  redirect("/dealer?ok=joined");
}

export async function inquiryAction(_state: FormState, formData: FormData): Promise<FormState> {
  const partId = text(formData, "part_id", 80);
  const name = text(formData, "name", 80);
  const phone = digits(text(formData, "phone", 30));
  const message = text(formData, "message", 1000);
  if (name.length < 2 || phone.length < 11 || message.length < 4) {
    return { error: "Name, phone and a short message are required." };
  }
  const result = await mutate(() => createInquiry({ partId, name, phone, message }));
  if (!result.ok) return { error: result.error };
  return { ok: "sent" };
}

export async function reviewAction(_state: FormState, formData: FormData): Promise<FormState> {
  const dealerId = text(formData, "dealer_id", 80);
  const name = text(formData, "name", 80);
  const phone = digits(text(formData, "phone", 30));
  const rating = Number(text(formData, "rating", 2));
  const comment = text(formData, "comment", 600);
  if (name.length < 2 || phone.length < 11) return { error: "Name and phone are required. One review is kept per phone number." };
  if (rating < 1 || rating > 5) return { error: "Choose a rating from 1 to 5." };
  const result = await mutate(() => createReview({ dealerId, name, phone, rating, comment }));
  if (!result.ok) return { error: result.error };
  return { ok: "review" };
}

export async function reportAction(_state: FormState, formData: FormData): Promise<FormState> {
  const partId = text(formData, "part_id", 80);
  const reason = text(formData, "reason", 80);
  const details = text(formData, "details", 500);
  if (!reportReasons.includes(reason as (typeof reportReasons)[number])) return { error: "Choose a reason." };
  const result = await mutate(() => createReport({ partId, reason, details }));
  if (!result.ok) return { error: result.error };
  return { ok: "report" };
}

export async function requestAction(_state: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name", 80);
  const phone = digits(text(formData, "phone", 30));
  const make = text(formData, "make", 40);
  const model = text(formData, "model", 40);
  const year = text(formData, "year", 4);
  const part = text(formData, "part", 120);
  const notes = text(formData, "notes", 500);
  if (name.length < 2 || phone.length < 11 || !make || part.length < 2) {
    return { error: "Name, phone, make and the part you need are required." };
  }
  const result = await mutate(() => createRequest({ name, phone, make, model, year, part, notes }));
  if (!result.ok) return { error: result.error };
  return { ok: "requested" };
}

export async function ensureDealer() {
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  if (!user) return null;
  const dealer = await getDealerForOwner(user.id);
  return { user, dealer };
}
