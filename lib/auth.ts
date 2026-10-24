import "server-only";

import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDealerForOwner, getUserById } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const COOKIE = "aat_session";

function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }
  return "dev-only-all-auto-tt-session";
}

export function hashPassword(password: string, salt = crypto.randomUUID()) {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const previous = Buffer.from(hash, "hex");
  if (previous.length !== next.length) return false;
  return timingSafeEqual(previous, next);
}

export function encodeSession(userId: string) {
  const body = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 30 * 86_400_000 })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function decodeSession(token: string) {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as { userId?: string; exp?: number };
    if (!payload.userId || !payload.exp || payload.exp < Date.now()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCurrentUser() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase!.auth.getUser();
    if (!data.user) return null;
    return getUserById(data.user.id);
  }
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = decodeSession(token);
  if (!session) return null;
  return getUserById(session.userId);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dealer");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

export async function requireDealer() {
  const user = await requireUser();
  if (user.role === "admin") {
    const dealer = await getDealerForOwner(user.id);
    return { user, dealer };
  }
  const dealer = await getDealerForOwner(user.id);
  if (!dealer || dealer.status === "removed") redirect("/dealer/signup");
  return { user, dealer: dealer };
}
