import { brand } from "@/lib/config";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function digits(phone: string) {
  const raw = phone.replace(/\D/g, "");
  if (raw.startsWith("1868") && raw.length === 11) return raw;
  if (raw.startsWith("868") && raw.length === 10) return `1${raw}`;
  if (raw.length === 7) return `1868${raw}`;
  return raw;
}

export function formatPhone(phone: string) {
  const value = digits(phone);
  if (value.length !== 11) return phone;
  return `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`;
}

export function waLink(phone: string, message?: string) {
  const base = `https://wa.me/${digits(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function partWhatsAppMessage(title: string, url: string) {
  return `Hi, I'm interested in ${title} (${url}) listed on ${brand.name}. Is it still available?`;
}

export function formatTTD(amount: number) {
  return `TT$${Math.round(amount).toLocaleString("en-TT")}`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-TT", {
    timeZone: "America/Port_of_Spain",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-TT", {
    timeZone: "America/Port_of_Spain",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function daysFromNow(days: number, from = Date.now()) {
  return new Date(from + days * 86_400_000).toISOString();
}

export function fitment(part: { year_from: number | null; year_to: number | null; make: string; model: string }) {
  let years = "";
  if (part.year_from && part.year_to) {
    years = part.year_from === part.year_to ? String(part.year_from) : `${part.year_from}–${part.year_to}`;
  } else if (part.year_from) {
    years = `${part.year_from}+`;
  }
  return [years, part.make, part.model].filter(Boolean).join(" ");
}

export function partMetaTitle(part: { title: string }) {
  return `${part.title} – Used | ${brand.name}`;
}

export function excerpt(value: string, length = 155) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length - 1).trim()}…`;
}

export function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function telLink(phone: string) {
  return `tel:+${digits(phone)}`;
}

export function years() {
  const list: number[] = [];
  for (let year = new Date().getFullYear() + 1; year >= 1998; year -= 1) list.push(year);
  return list;
}

export function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dealer";
  return value;
}
