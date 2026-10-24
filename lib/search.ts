import type { PartQuery, SortKey } from "@/lib/types";

export function toQuery(sp: Record<string, string | string[] | undefined>): PartQuery {
  const one = (key: string) => {
    const value = sp[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
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
    make: one("make") || undefined,
    model: one("model") || undefined,
    year: num("year"),
    category: one("category") || undefined,
    condition: one("condition") || undefined,
    location: one("location") || undefined,
    min: num("min"),
    max: num("max"),
    q: one("q") || undefined,
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
