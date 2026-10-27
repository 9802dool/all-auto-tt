import type { Metadata } from "next";
import Link from "next/link";
import { cachedDealers } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Parts dealers in Trinidad & Tobago",
  description:
    "Directory of approved parts yards and shops in Trinidad and Tobago. Open a storefront, browse stock, and contact dealers on WhatsApp.",
};

export default async function DealersPage() {
  const dealers = await cachedDealers();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Dealers</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Approved yards and shops. Open a storefront, then WhatsApp them about a part.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {dealers.map((dealer) => (
          <Link key={dealer.id} href={`/dealers/${dealer.slug}`} className="rounded-3xl border border-border bg-white p-5">
            <div className="flex items-center gap-3">
              {dealer.logo ? <img src={dealer.logo} alt={`${dealer.business_name} logo`} className="size-14 rounded-2xl" /> : null}
              <div>
                <h2 className="text-xl font-semibold">{dealer.business_name}</h2>
                <p className="text-sm text-muted-foreground">{dealer.region} · {dealer.listings} live parts</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm">{dealer.about}</p>
            {dealer.verified ? <p className="mt-3 text-xs font-bold tracking-wide text-orange-ink uppercase">Verified dealer</p> : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
