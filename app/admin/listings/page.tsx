import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { featureAdminAction, listingStatusAction } from "@/app/actions/admin";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { firstParam, formatTTD } from "@/lib/format";

export const metadata: Metadata = { title: "Listings" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function ListingsPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading listings…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  await requireAdmin();
  const [data, query] = await Promise.all([listEverything(), searchParams]);
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Listings</h1>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <ul className="grid gap-2">
        {data.parts.map((part) => (
          <li key={part.id} className="rounded-2xl border border-border bg-white p-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link href={`/parts/${part.slug}`} className="font-semibold hover:text-orange-ink">{part.title}</Link>
              <span className="text-xs font-semibold uppercase">{part.status}{part.featured_now ? " · featured" : ""}{part.example ? " · sample" : ""}</span>
            </div>
            <p className="text-muted-foreground">{part.dealer.business_name} · {formatTTD(part.price_ttd)} · {part.location}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["available", "reserved", "sold", "removed"] as const).map((status) => (
                <form key={status} action={listingStatusAction}>
                  <input type="hidden" name="id" value={part.id} />
                  <input type="hidden" name="status" value={status} />
                  <SubmitButton size="sm" variant={part.status === status ? "default" : "outline"}>{status}</SubmitButton>
                </form>
              ))}
              <form action={featureAdminAction}>
                <input type="hidden" name="id" value={part.id} />
                <input type="hidden" name="featured" value={part.featured_now ? "false" : "true"} />
                <SubmitButton size="sm" variant="accent">{part.featured_now ? "Unfeature" : "Feature"}</SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
