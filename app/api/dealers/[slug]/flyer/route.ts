import { connection } from "next/server";
import { flyerPdf } from "@/lib/flyers";
import { siteUrl } from "@/lib/config";
import { formatPhone } from "@/lib/format";
import { getDealerBySlug } from "@/lib/data";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await context.params;
  const found = await getDealerBySlug(slug);
  if (!found || found.dealer.status === "removed") return new Response("Dealer not found", { status: 404 });
  const dealer = found.dealer;
  const url = `${siteUrl()}/dealers/${dealer.slug}`;
  const pdf = await flyerPdf({
    kicker: "Used parts · Trinidad & Tobago",
    title: dealer.business_name,
    lines: [
      dealer.address,
      dealer.region,
      formatPhone(dealer.phone),
      dealer.hours || "Ask for opening hours",
      "WhatsApp the dealer. Inspect the part. Pay on pickup.",
    ],
    url,
    footer: "Find it on ALL AUTO TT",
  });
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${dealer.slug}-flyer.pdf"`,
    },
  });
}
