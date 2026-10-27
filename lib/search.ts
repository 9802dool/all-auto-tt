import { otherMakeValue } from "@/lib/config";
import type { PartQuery, SortKey } from "@/lib/types";

export function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function keywordTokens(value: string) {
  return cleanText(value)
    .toLowerCase()
    .split(" ")
    .map((token) => token.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ""))
    .filter((token) => token.length > 0);
}

/** Every word must appear somewhere in the listing text. Matching is case-insensitive. */
export function matchesKeywords(
  part: { title: string; description: string; make: string; model: string; category: string; engine_code?: string },
  q: string,
) {
  const tokens = keywordTokens(q);
  if (!tokens.length) return true;
  const hay = `${part.title} ${part.description} ${part.make} ${part.model} ${part.category} ${part.engine_code ?? ""}`.toLowerCase();
  return tokens.every((token) => hay.includes(token));
}

export function sameText(a: string, b: string) {
  return cleanText(a).toLowerCase() === cleanText(b).toLowerCase();
}

/** Map a stored or typed make onto the dropdown, or onto the Other make field. */
export function resolveMakeChoice(current: string | undefined, known: string[], emptyChoice = "") {
  const trimmed = cleanText(current ?? "");
  const match = known.find((name) => name.toLowerCase() === trimmed.toLowerCase());
  if (match) return { choice: match, custom: "" };
  if (!trimmed || trimmed === otherMakeValue) return { choice: emptyChoice, custom: "" };
  return { choice: otherMakeValue, custom: trimmed };
}

export function toQuery(sp: Record<string, string | string[] | undefined>): PartQuery {
  const one = (key: string) => {
    const value = sp[key];
    return cleanText((Array.isArray(value) ? value[0] : value) ?? "");
  };
  const optional = (key: string) => {
    const value = one(key);
    if (!value || value === otherMakeValue) return undefined;
    return value;
  };
  const num = (key: string) => {
    const value = one(key);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const sort = one("sort");
  const allowed: SortKey[] = ["recommended", "newest", "price_asc", "price_desc"];
  return {
    make: optional("make"),
    model: optional("model"),
    year: num("year"),
    category: optional("category"),
    condition: optional("condition"),
    location: optional("location"),
    min: num("min"),
    max: num("max"),
    q: optional("q"),
    sort: allowed.includes(sort as SortKey) ? (sort as SortKey) : "recommended",
    page: Math.max(1, num("page") ?? 1),
  };
}

export function browseHref(query: Record<string, string | number | undefined>, page = 1) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, page: page > 1 ? page : undefined })) {
    if (value === undefined) continue;
    const text = String(value);
    if (text !== "") params.set(key, text);
  }
  const qs = params.toString();
  return qs ? `/browse?${qs}` : "/browse";
}
