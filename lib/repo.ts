import "server-only";

import { get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createSeed } from "@/lib/seed";
import type { DB } from "@/lib/types";

const DB_PATH = "all-auto-tt/db.json";
const FRESH_MS = 5_000;

let memory: { db: DB; at: number } | null = null;
let queue: Promise<unknown> = Promise.resolve();
let blobDownUntil = 0;

export function usingBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function dataFile() {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  return { dir, file: path.join(dir, "db.json") };
}

export async function loadDb(): Promise<DB> {
  if (usingBlob()) return structuredClone(await loadBlob());
  if (process.env.VERCEL) return structuredClone(createSeed());
  return structuredClone(await loadLocal());
}

async function loadBlob(): Promise<DB> {
  if (memory && Date.now() - memory.at < FRESH_MS) return memory.db;
  if (Date.now() < blobDownUntil) return memory?.db ?? createSeed();
  try {
    const result = await get(DB_PATH, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) {
      const seed = createSeed();
      await saveBlob(seed);
      return seed;
    }
    const db = JSON.parse(await new Response(result.stream).text()) as DB;
    memory = { db, at: Date.now() };
    return db;
  } catch (error) {
    console.error("[all-auto-tt] could not read the saved yard:", error instanceof Error ? error.message : error);
    blobDownUntil = Date.now() + 30_000;
    return memory?.db ?? createSeed();
  }
}

async function saveBlob(db: DB) {
  await put(DB_PATH, JSON.stringify(db), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
  memory = { db, at: Date.now() };
}

async function loadLocal(): Promise<DB> {
  if (memory && Date.now() - memory.at < FRESH_MS) return memory.db;
  const { dir, file } = dataFile();
  try {
    const db = JSON.parse(await readFile(/* turbopackIgnore: true */ file, "utf8")) as DB;
    memory = { db, at: Date.now() };
    return db;
  } catch {
    const db = createSeed();
    await mkdir(dir, { recursive: true });
    await writeFile(/* turbopackIgnore: true */ file, JSON.stringify(db, null, 2));
    memory = { db, at: Date.now() };
    return db;
  }
}

async function persistLocal(db: DB) {
  const { dir, file } = dataFile();
  memory = { db, at: Date.now() };
  await mkdir(dir, { recursive: true });
  await writeFile(/* turbopackIgnore: true */ file, JSON.stringify(db, null, 2));
}

function friendlySaveError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/fetch failed|ENOTFOUND|getaddrinfo|EAI_AGAIN|token|BLOB|store/i.test(message)) {
    return new ActionError("We could not save that. The file store is not connected yet. The sample yard is still on the site.");
  }
  return error;
}

export async function commit<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    if (usingBlob()) memory = null;
    const before = usingBlob() ? await loadBlob() : await loadDb();
    const draft = structuredClone(before);
    const result = fn(draft);
    if (usingBlob()) {
      try {
        await saveBlob(draft);
      } catch (error) {
        throw friendlySaveError(error);
      }
    } else if (process.env.VERCEL) {
      throw new ActionError("We could not save that yet. Connect the free file store, then try again. The sample yard is still on the site.");
    } else {
      await persistLocal(draft);
    }
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export class ActionError extends Error {}
