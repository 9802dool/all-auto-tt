import { connection } from "next/server";
import { runMaintenance } from "@/lib/data";
import { deliverQueuedEmails } from "@/lib/email";

export async function GET(request: Request) {
  await connection();
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await runMaintenance();
  const mail = await deliverQueuedEmails();
  return Response.json({ ok: true, ...mail });
}
