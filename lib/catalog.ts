import { cacheLife, cacheTag } from "next/cache";
import { adsFor, arrivals, getCatalog, getDealerBySlug, getPublicPart, homeData, listPublicDealers, searchParts, sitemapEntries } from "@/lib/data";
import type { AdPlacement, PartQuery } from "@/lib/types";

export async function cachedHome() {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const [home, catalog] = await Promise.all([homeData(), getCatalog()]);
  return { home, catalog };
}

export async function cachedPart(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog", `part:${slug}`);
  return getPublicPart(slug);
}

export async function cachedSearch(query: PartQuery) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const [results, catalog] = await Promise.all([searchParts(query), getCatalog()]);
  return { results, catalog };
}

export async function cachedAds(placement: AdPlacement) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return adsFor(placement);
}

export async function cachedArrivals() {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return arrivals(40);
}

export async function cachedDealer(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return getDealerBySlug(slug);
}

export async function cachedDealers() {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return listPublicDealers();
}

export async function cachedSitemap() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return sitemapEntries();
}
