import { connection } from "next/server";
import { brand, siteUrl } from "@/lib/config";
import { arrivals } from "@/lib/data";
import { excerpt, formatTTD } from "@/lib/format";

export async function GET() {
  await connection();
  const items = await arrivals(40);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(brand.name)} new arrivals</title>
    <link>${siteUrl()}/new</link>
    <description>${escapeXml(brand.tagline)}</description>
    ${items
      .map(
        (part) => `<item>
      <title>${escapeXml(part.title)} — ${escapeXml(formatTTD(part.price_ttd))}</title>
      <link>${siteUrl()}/parts/${part.slug}</link>
      <guid>${siteUrl()}/parts/${part.slug}</guid>
      <pubDate>${new Date(part.created_at).toUTCString()}</pubDate>
      <description>${escapeXml(excerpt(part.description, 240))}</description>
    </item>`,
      )
      .join("\n")}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
