import { connection } from "next/server";
import { brand, siteUrl } from "@/lib/config";
import { flyerPdf } from "@/lib/flyers";

export async function GET() {
  await connection();
  const pdf = await flyerPdf({
    kicker: "For workshops and mechanics",
    title: "Find parts fast",
    lines: [
      "Used engines, gearboxes and body parts.",
      "Every dealer in Trinidad & Tobago, one search.",
      "WhatsApp the yard. Inspect before you pay.",
      "ALL AUTO TT does not sell the part.",
      brand.tagline,
    ],
    url: siteUrl(),
    footer: "Scan to browse allautott.com",
  });
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="all-auto-tt-find-parts.pdf"',
    },
  });
}
