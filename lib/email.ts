import "server-only";

import { markEmails, queuedEmails } from "@/lib/data";
import type { EmailMessage } from "@/lib/types";

export async function deliverQueuedEmails() {
  const queued = await queuedEmails();
  const sent: string[] = [];
  const logged: string[] = [];
  for (const email of queued) {
    const status = await deliverEmail(email);
    if (status === "sent") sent.push(email.id);
    else logged.push(email.id);
  }
  if (sent.length) await markEmails(sent, "sent");
  if (logged.length) await markEmails(logged, "logged");
  return { sent: sent.length, logged: logged.length };
}

export async function deliverEmail(message: EmailMessage) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "logged" as const;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "ALL AUTO TT <parts@allautott.com>",
      to: [message.to],
      subject: message.subject,
      text: message.body,
    }),
  });
  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}`);
  }
  return "sent" as const;
}
