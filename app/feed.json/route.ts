import { connection } from "next/server";
import { brand, siteUrl } from "@/lib/config";
import { arrivals } from "@/lib/data";
import { excerpt, formatTTD } from "@/lib/format";

export async function GET() {
  await connection();
  const items = await arrivals(40);
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${brand.name} new arrivals`,
    home_page_url: `${siteUrl()}/new`,
    feed_url: `${siteUrl()}/feed.json`,
    description: brand.tagline,
    items: items.map((part) => ({
      id: `${siteUrl()}/parts/${part.slug}`,
      url: `${siteUrl()}/parts/${part.slug}`,
      title: `${part.title} — ${formatTTD(part.price_ttd)}`,
      content_text: excerpt(part.description, 280),
      date_published: part.created_at,
      image: part.photos[0]?.startsWith("http") ? part.photos[0] : `${siteUrl()}${part.photos[0] || ""}`,
      authors: [{ name: part.dealer.business_name }],
    })),
  };
  return Response.json(feed);
}
