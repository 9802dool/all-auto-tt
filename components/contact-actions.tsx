"use client";

import { useState } from "react";
import { siteUrl } from "@/lib/config";
import { partWhatsAppMessage, telLink, waLink } from "@/lib/format";

export function ContactActions({
  partId,
  title,
  slug,
  phone,
  whatsapp,
  stacked = false,
}: {
  partId: string;
  title: string;
  slug: string;
  phone: string;
  whatsapp: string;
  stacked?: boolean;
}) {
  const [shared, setShared] = useState("");

  function track(type: "whatsapp" | "call") {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partId, type }),
    });
  }

  const message = partWhatsAppMessage(title, `${siteUrl()}/parts/${slug}`);

  async function share() {
    const url = `${window.location.origin}/parts/${slug}`;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    setShared("Link copied.");
  }

  return (
    <div className={stacked ? "grid gap-2" : "grid gap-2 sm:grid-cols-2"}>
      <a
        className="inline-flex h-12 items-center justify-center rounded-xl bg-whatsapp px-4 text-base font-semibold text-white"
        href={waLink(whatsapp, message)}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("whatsapp")}
      >
        WhatsApp dealer
      </a>
      <a
        className="inline-flex h-12 items-center justify-center rounded-xl bg-charcoal px-4 text-base font-semibold text-white"
        href={telLink(phone)}
        onClick={() => track("call")}
      >
        Call dealer
      </a>
      <button type="button" onClick={() => void share()} className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold sm:col-span-2">
        Share this part
      </button>
      {shared ? <p className="text-sm text-muted-foreground sm:col-span-2">{shared}</p> : null}
    </div>
  );
}
