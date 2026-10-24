import type { Metadata } from "next";
import { Suspense } from "react";
import { CopyButton } from "@/components/copy-button";
import { requireAdmin } from "@/lib/auth";
import { brand, siteUrl } from "@/lib/config";
import { arrivals } from "@/lib/data";
import { formatTTD } from "@/lib/format";

export const metadata: Metadata = { title: "New arrivals digest" };

export default function DigestPage() {
  return (
    <Suspense fallback={<p>Building the digest…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  await requireAdmin();
  const items = await arrivals(12);
  const lines = [
    `${brand.name} — new arrivals`,
    brand.tagline,
    "",
    ...items.map((part) => `• ${part.title} — ${formatTTD(part.price_ttd)} — ${part.location}\n  ${siteUrl()}/parts/${part.slug}`),
    "",
    `Browse everything: ${siteUrl()}/browse`,
    `New arrivals page: ${siteUrl()}/new`,
  ];
  const text = lines.join("\n");
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Daily digest</h1>
      <p className="text-sm text-muted-foreground">Copy this into the WhatsApp channel or a Facebook post. It lists the newest public parts.</p>
      <CopyButton text={text} label="Copy digest" />
      <pre className="overflow-auto rounded-2xl border border-border bg-white p-4 text-sm whitespace-pre-wrap">{text}</pre>
    </>
  );
}
