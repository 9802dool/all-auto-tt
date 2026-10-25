import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/config";
import { waLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page could not be found on ALL AUTO TT.",
};

export default function NotFound() {
  const whatsappHref = waLink(brand.whatsapp, "Hi ALL AUTO TT, I need help finding a part.");
  
  return (
    <main className="mx-auto max-w-xl px-4 py-20">
      <p className="text-sm font-semibold tracking-wide text-orange-ink uppercase">404</p>
      <h1 className="font-display text-5xl font-extrabold uppercase">That page is not on the yard</h1>
      <p className="mt-3 text-muted-foreground">The listing may have been sold, expired, or the link is wrong.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-xl bg-charcoal px-4 font-semibold text-white hover:bg-charcoal/90">
          Home
        </Link>
        <Link href="/browse" className="inline-flex h-11 items-center rounded-xl bg-charcoal px-4 font-semibold text-white hover:bg-charcoal/90">
          Browse parts
        </Link>
        <a 
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center rounded-xl border border-border bg-white px-4 font-semibold hover:border-orange"
        >
          WhatsApp help
        </a>
      </div>
    </main>
  );
}
