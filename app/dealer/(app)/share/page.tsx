import type { Metadata } from "next";
import { Suspense } from "react";
import { CopyButton } from "@/components/copy-button";
import { ShareKit } from "@/components/share-kit";
import { requireDealer } from "@/lib/auth";
import { siteUrl } from "@/lib/config";
import { dealerDashboard } from "@/lib/data";

export const metadata: Metadata = { title: "Share kit" };

export default function SharePage() {
  return (
    <Suspense fallback={<p>Loading the share kit…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const dash = await dealerDashboard(dealer.id);
  const storefront = `${siteUrl()}/dealers/${dealer.slug}`;
  const home = siteUrl();
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Share kit</h1>
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">Storefront</h2>
        <p className="mt-1 text-sm break-all">{storefront}</p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <img
            src={`/api/qr?text=${encodeURIComponent(storefront)}`}
            alt={`QR code for ${dealer.business_name}`}
            width={180}
            height={180}
            className="rounded-xl border border-border bg-white"
          />
          <div className="flex flex-wrap gap-2">
            <CopyButton text={storefront} label="Copy link" />
            <a className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-2.5 text-sm font-medium" href={`/api/dealers/${dealer.slug}/flyer`}>
              Print flyer (PDF)
            </a>
          </div>
        </div>
      </section>
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">For mechanics</h2>
        <p className="mt-1 text-sm">A generic “Find parts fast” flyer. Leave it on a workshop counter. It opens ALL AUTO TT, not one dealer.</p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <img src={`/api/qr?text=${encodeURIComponent(home)}`} alt="QR code for ALL AUTO TT" width={140} height={140} className="rounded-xl border border-border" />
          <a className="inline-flex h-11 items-center rounded-xl bg-charcoal px-4 text-sm font-semibold text-white" href={"/api/flyers/mechanics"}>
            Download mechanics flyer
          </a>
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl font-bold uppercase">Part cards</h2>
        {dash.parts.filter((part) => part.status !== "removed").slice(0, 12).map((part) => (
          <article key={part.id} className="rounded-2xl border border-border bg-white p-4">
            <h3 className="font-semibold">{part.title}</h3>
            <div className="mt-2">
              <ShareKit slug={part.slug} title={part.title} />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
