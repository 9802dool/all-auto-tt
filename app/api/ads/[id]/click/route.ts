import { trackAd } from "@/lib/data";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const ad = await trackAd(id, "click");
  const link = ad?.link || "/advertise";
  const origin = new URL(request.url).origin;
  const target = link.startsWith("http://") || link.startsWith("https://") ? link : new URL(link.startsWith("/") ? link : "/", origin).toString();
  return Response.redirect(target);
}
