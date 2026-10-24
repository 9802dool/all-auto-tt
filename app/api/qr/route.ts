import { connection } from "next/server";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/config";

export async function GET(request: Request) {
  await connection();
  const text = new URL(request.url).searchParams.get("text") || siteUrl();
  const allowed = text.startsWith(siteUrl()) || text.startsWith("http://127.0.0.1") || text.startsWith("http://localhost");
  if (!allowed) return new Response("Only ALL AUTO TT links can be encoded.", { status: 400 });
  const png = await QRCode.toBuffer(text, { width: 640, margin: 1, errorCorrectionLevel: "M" });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
