import { categories, conditions, regions } from "@/lib/config";
import { renewExpiry } from "@/lib/visibility";
import type { Part } from "@/lib/types";

export type CsvPart = Omit<
  Part,
  | "id"
  | "slug"
  | "dealer_id"
  | "views"
  | "whatsapp_clicks"
  | "call_clicks"
  | "inquiry_count"
  | "example"
  | "created_at"
  | "updated_at"
  | "expiry_reminder_for"
  | "renewed_at"
>;

const headers = [
  "title",
  "category",
  "make",
  "model",
  "year_from",
  "year_to",
  "engine_code",
  "transmission_type",
  "condition",
  "price_ttd",
  "negotiable",
  "description",
  "location",
  "status",
] as const;

export function csvTemplate() {
  const sample = [
    "2014 Toyota Axio Gearbox",
    "Gearbox/Transmission",
    "Toyota",
    "Axio",
    "2012",
    "2014",
    "1NZ-FE",
    "Automatic",
    "Used – Tested",
    "4200",
    "no",
    "Automatic gearbox, tested on the bench.",
    "Chaguanas",
    "available",
  ];
  return `${headers.join(",")}\n${sample.map(escapeCsv).join(",")}\n`;
}

export function parseCsv(text: string): { rows: CsvPart[]; errors: string[] } {
  const records = parseRecords(text);
  if (!records.length) return { rows: [], errors: ["The file is empty."] };
  const header = records[0].map((cell) => cell.trim().toLowerCase());
  const missing = headers.filter((column) => !header.includes(column));
  if (missing.length) return { rows: [], errors: [`Missing columns: ${missing.join(", ")}`] };
  const index = Object.fromEntries(header.map((column, position) => [column, position]));
  const rows: CsvPart[] = [];
  const errors: string[] = [];
  records.slice(1).forEach((record, offset) => {
    if (record.every((cell) => !cell.trim())) return;
    const cell = (name: string) => record[index[name]]?.trim() ?? "";
    const line = offset + 2;
    const title = cell("title");
    const category = cell("category");
    const price = Number(cell("price_ttd"));
    if (!title) errors.push(`Line ${line}: title is required.`);
    if (!categories.some((item) => item.name === category)) errors.push(`Line ${line}: category must match the site list.`);
    if (!Number.isFinite(price) || price < 0) errors.push(`Line ${line}: price_ttd must be a number.`);
    const condition = cell("condition") || "Used – Untested";
    if (!conditions.includes(condition as (typeof conditions)[number])) errors.push(`Line ${line}: condition is not recognised.`);
    const location = cell("location");
    if (location && !regions.some((region) => region.name === location)) errors.push(`Line ${line}: location is not a known region.`);
    const status = cell("status") || "available";
    if (!["available", "reserved", "sold"].includes(status)) errors.push(`Line ${line}: status must be available, reserved or sold.`);
    if (errors.some((error) => error.startsWith(`Line ${line}:`))) return;
    const yearFrom = numberOrNull(cell("year_from"));
    const yearTo = numberOrNull(cell("year_to"));
    rows.push({
      title,
      category,
      make: cell("make"),
      model: cell("model"),
      year_from: yearFrom,
      year_to: yearTo,
      engine_code: cell("engine_code"),
      transmission_type: cell("transmission_type") || "Unknown",
      condition,
      price_ttd: Math.round(price),
      negotiable: ["yes", "true", "1"].includes(cell("negotiable").toLowerCase()),
      description: cell("description"),
      photos: ["/parts/workshop.jpg"],
      location: location || "Chaguanas",
      status: status as CsvPart["status"],
      featured: false,
      featured_until: null,
      expires_at: renewExpiry(),
      sold_at: status === "sold" ? new Date().toISOString() : null,
    });
  });
  return { rows, errors };
}

function numberOrNull(value: string) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function parseRecords(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((record) => record.some((value) => value.trim()));
}
