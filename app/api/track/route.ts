import { connection } from "next/server";
import { trackAd, trackPart } from "@/lib/data";
import { queueLeadAlert } from "@/lib/later";

const partTypes = new Set(["view", "whatsapp", "call", "form"]);

export async function POST(request: Request) {
  await connection();
  const body = (await request.json().catch(() => null)) as { partId?: string; adId?: string; type?: string } | null;
  if (!body?.type) return Response.json({ ok: false }, { status: 400 });
  if (body.type === "ad_impression" && body.adId) {
    await trackAd(String(body.adId), "impression");
    return Response.json({ ok: true });
  }
  if (!body.partId || !partTypes.has(body.type)) return Response.json({ ok: false }, { status: 400 });
  const type = body.type as "view" | "whatsapp" | "call" | "form";
  const part = await trackPart(String(body.partId), type);
  if (part && type !== "view") {
    await queueLeadAlert({ dealerId: part.dealer_id, partId: part.id, type, at: new Date().toISOString() });
  }
  return Response.json({ ok: true });
}
