import { connection } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { formatTTD } from "@/lib/format";
import { loadDb } from "@/lib/repo";
import { siteUrl } from "@/lib/config";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await context.params;
  const story = new URL(request.url).searchParams.get("size") === "story";
  const width = 1080;
  const height = story ? 1920 : 1080;
  const db = await loadDb();
  const part = db.parts.find((item) => item.slug === slug);
  const dealer = part ? db.dealers.find((item) => item.id === part.dealer_id) : undefined;
  if (!part || !dealer) return new Response("Listing not found", { status: 404 });
  const photo = await asDataUrl(part.photos[0] || "/parts/workshop.jpg");
  const photoHeight = story ? 1180 : 700;
  const price = formatTTD(part.price_ttd);
  const place = `${dealer.business_name} · ${part.location}`;

  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          background: "#111827",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <img src={photo} width={width} height={photoHeight} style={{ objectFit: "cover", width, height: photoHeight }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 48,
            flexGrow: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 36, fontWeight: 800 }}>ALL AUTO</div>
            <div
              style={{
                display: "flex",
                background: "#F97316",
                color: "#111827",
                fontWeight: 800,
                fontSize: 28,
                marginLeft: 16,
                padding: 8,
              }}
            >
              TT
            </div>
          </div>
          <div style={{ display: "flex", fontSize: story ? 64 : 48, fontWeight: 800, marginTop: 24 }}>{part.title}</div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: "#F97316", marginTop: 16 }}>{price}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#e5e7eb", marginTop: 16 }}>{place}</div>
          <div style={{ display: "flex", fontSize: 28, color: "#d1d5db", marginTop: 28 }}>{siteUrl().replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    { width, height },
  );
}

async function asDataUrl(src: string) {
  const bytes = src.startsWith("http")
    ? Buffer.from(await (await fetch(src)).arrayBuffer())
    : await readFile(/* turbopackIgnore: true */ path.join(process.cwd(), "public", src.replace(/^\//, "")));
  const mime = src.endsWith(".png") ? "image/png" : src.endsWith(".webp") ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
