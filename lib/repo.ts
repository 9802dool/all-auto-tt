import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createSeed } from "@/lib/seed";
import type { DB, User } from "@/lib/types";

const tableMap = {
  users: "profiles",
  dealers: "dealers",
  categories: "categories",
  makes: "makes",
  models: "models",
  parts: "parts",
  payments: "payments",
  reviews: "reviews",
  reports: "reports",
  leads: "leads",
  inquiries: "inquiries",
  requests: "part_requests",
  ads: "ads",
  ad_events: "ad_events",
  spotlights: "spotlights",
  emails: "emails",
} as const;

type TableKey = keyof typeof tableMap;

const writeOrder: TableKey[] = [
  "users",
  "categories",
  "makes",
  "models",
  "dealers",
  "parts",
  "payments",
  "reviews",
  "reports",
  "leads",
  "inquiries",
  "requests",
  "ads",
  "ad_events",
  "spotlights",
  "emails",
];

const dateKeys = new Set([
  "created_at",
  "updated_at",
  "expires_at",
  "sold_at",
  "renewed_at",
  "featured_until",
  "plan_expires_at",
  "period_start",
  "period_end",
  "starts_at",
  "ends_at",
]);

const numberKeys = new Set([
  "price_ttd",
  "amount_ttd",
  "rating_avg",
  "lat",
  "lng",
  "views",
  "whatsapp_clicks",
  "call_clicks",
  "inquiry_count",
  "rating_count",
  "year_from",
  "year_to",
  "rating",
  "impressions",
  "clicks",
  "sort",
]);

let memory: DB | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function usingSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function dataFile() {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  return { dir, file: path.join(dir, "db.json") };
}

function adminClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stable(item)).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizeValue(key: string, value: unknown) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (numberKeys.has(key)) {
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : null;
  }
  if (dateKeys.has(key) && typeof value === "string") {
    const time = Date.parse(value);
    return Number.isNaN(time) ? value : new Date(time).toISOString();
  }
  return value;
}

function normalizeRow<T>(row: Record<string, unknown>, sample: T): T {
  const next = {} as Record<string, unknown>;
  for (const key of Object.keys(sample as object)) {
    next[key] = normalizeValue(key, row[key]);
  }
  return next as T;
}

async function loadLocal(): Promise<DB> {
  if (memory) return memory;
  const { dir, file } = dataFile();
  try {
    memory = JSON.parse(await readFile(/* turbopackIgnore: true */ file, "utf8")) as DB;
    return memory;
  } catch {
    memory = createSeed();
    await mkdir(dir, { recursive: true });
    await writeFile(/* turbopackIgnore: true */ file, JSON.stringify(memory, null, 2));
    return memory;
  }
}

async function loadSupabase(): Promise<DB> {
  const client = adminClient();
  const seed = createSeed();
  const db = {} as DB;
  for (const key of writeOrder) {
    const { data, error } = await client.from(tableMap[key]).select("*");
    if (error) throw new Error(`Supabase ${tableMap[key]}: ${error.message}`);
    const sample = seed[key][0];
    const rows = (data ?? []) as Record<string, unknown>[];
    if (key === "users") {
      db.users = rows.map((row) => ({
        ...normalizeRow(row, sample as User),
        password_hash: null,
      }));
    } else if (sample) {
      (db[key] as unknown[]) = rows.map((row) => normalizeRow(row, sample));
    } else {
      (db[key] as unknown[]) = rows;
    }
  }
  return db;
}

export async function loadDb(): Promise<DB> {
  const db = usingSupabase() ? await loadSupabase() : await loadLocal();
  return structuredClone(db);
}

async function persistLocal(draft: DB) {
  const { dir, file } = dataFile();
  memory = draft;
  await mkdir(dir, { recursive: true });
  await writeFile(/* turbopackIgnore: true */ file, JSON.stringify(draft, null, 2));
}

function toRow(key: TableKey, row: Record<string, unknown>) {
  if (key !== "users") return row;
  const { password_hash: _password, ...profile } = row;
  return profile;
}

function asRows(rows: DB[TableKey]) {
  return rows as { id: string }[];
}

async function persistSupabase(before: DB, after: DB) {
  const client = adminClient();
  for (const key of writeOrder) {
    const previousRows = asRows(before[key]);
    const nextRows = asRows(after[key]);
    const previous = new Map(previousRows.map((row) => [row.id, stable(key === "users" ? toRow(key, row) : row)]));
    const nextIds = new Set(nextRows.map((row) => row.id));
    const upserts = nextRows
      .filter((row) => previous.get(row.id) !== stable(key === "users" ? toRow(key, row) : row))
      .map((row) => toRow(key, row));
    if (upserts.length) {
      const { error } = await client.from(tableMap[key]).upsert(upserts);
      if (error) throw new Error(`Supabase save ${tableMap[key]}: ${error.message}`);
    }
    const deleted = previousRows.filter((row) => !nextIds.has(row.id)).map((row) => row.id);
    if (deleted.length) {
      const { error } = await client.from(tableMap[key]).delete().in("id", deleted);
      if (error) throw new Error(`Supabase delete ${tableMap[key]}: ${error.message}`);
    }
  }
}

export async function commit<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    const before = await loadDb();
    const draft = structuredClone(before);
    const result = fn(draft);
    if (usingSupabase()) await persistSupabase(before, draft);
    else await persistLocal(draft);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export class ActionError extends Error {}
