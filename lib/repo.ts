import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { ownerEmail } from "@/lib/config";
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
  const dir =
    process.env.DATA_DIR ||
    (process.env.VERCEL ? path.join("/tmp", "all-auto-tt") : path.join(process.cwd(), "data"));
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

async function readSupabase(client: SupabaseClient, seed: DB): Promise<DB> {
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

function seedRows(seed: DB, key: TableKey) {
  return (seed[key] as unknown as Record<string, unknown>[]).map((row) => toRow(key, row));
}

async function upsertRows(client: SupabaseClient, key: TableKey, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const { error } = await client.from(tableMap[key]).upsert(rows);
  if (error) throw new Error(`Supabase seed ${tableMap[key]}: ${error.message}`);
}

async function promoteConfiguredAdmin(client: SupabaseClient, db: DB) {
  const email = ownerEmail();
  if (!email) return;
  const user = db.users.find((item) => item.email.toLowerCase() === email);
  if (!user || user.role === "admin") return;
  const { error } = await client.from("profiles").update({ role: "admin" }).eq("id", user.id);
  if (error) throw new Error(`Supabase admin promote: ${error.message}`);
  user.role = "admin";
}

async function ensureSampleRows(client: SupabaseClient, db: DB, seed: DB) {
  let changed = false;
  if (db.categories.length === 0) {
    await upsertRows(client, "categories", seedRows(seed, "categories"));
    changed = true;
  }
  if (db.makes.length === 0) {
    await upsertRows(client, "makes", seedRows(seed, "makes"));
    changed = true;
  }
  const knownMakes = new Set((db.makes.length ? db.makes : seed.makes).map((make) => make.name));
  const have = new Set(db.models.map((model) => `${model.make}\0${model.name}`));
  const missingModels = seed.models.filter((model) => knownMakes.has(model.make) && !have.has(`${model.make}\0${model.name}`));
  if (missingModels.length) {
    await upsertRows(client, "models", missingModels as unknown as Record<string, unknown>[]);
    changed = true;
  }

  const realDealer = db.dealers.some((dealer) => !dealer.example);
  const exampleParts = db.parts.filter((part) => part.example).length;
  if (!realDealer && exampleParts < 30) {
    const tables: TableKey[] = ["dealers", "parts", "payments", "reviews", "reports", "leads", "inquiries", "requests", "ads", "spotlights"];
    for (const key of tables) await upsertRows(client, key, seedRows(seed, key));
    changed = true;
  }
  return changed;
}

async function loadSupabase(): Promise<DB> {
  const client = adminClient();
  const seed = createSeed();
  let db = await readSupabase(client, seed);
  try {
    await promoteConfiguredAdmin(client, db);
    const changed = await ensureSampleRows(client, db, seed);
    if (changed) db = await readSupabase(client, seed);
  } catch (error) {
    console.error("[all-auto-tt] sample yards were not saved:", error instanceof Error ? error.message : error);
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
