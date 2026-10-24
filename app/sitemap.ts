import type { MetadataRoute } from "next";
import { cachedSitemap } from "@/lib/catalog";
import { siteUrl } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await cachedSitemap();
  const base = siteUrl();
  const staticRoutes = ["", "/browse", "/dealers", "/request", "/for-dealers", "/advertise", "/new", "/safety"].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.6,
  }));
  const parts = data.parts.map((slug) => ({
    url: `${base}/parts/${slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
  const dealers = data.dealers.map((slug) => ({
    url: `${base}/dealers/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const landings = data.makes.flatMap((make) => [
    { url: `${base}/${make}`, changeFrequency: "daily" as const, priority: 0.7 },
    ...data.categories.map((category) => ({
      url: `${base}/${make}/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ]);
  return [...staticRoutes, ...parts, ...dealers, ...landings];
}
