import type { Metadata } from "next";
import { Suspense } from "react";
import { deleteSpotlightAction, spotlightAction } from "@/app/actions/admin";
import { Flash } from "@/components/flash";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { firstParam } from "@/lib/format";

export const metadata: Metadata = { title: "Spotlights" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function SpotlightsPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading spotlights…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  await requireAdmin();
  const [data, query] = await Promise.all([listEverything(), searchParams]);
  const names = new Map(data.dealers.map((dealer) => [dealer.id, dealer.business_name]));
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Dealer spotlight</h1>
      <p className="text-sm text-muted-foreground">Sell Dealer of the Month or a homepage spotlight, then set the dates here. The homepage reads the active spot.</p>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <form action={spotlightAction} className="grid gap-3 rounded-3xl border border-border bg-white p-4 sm:grid-cols-2">
        <Field label="Dealer">
          <select className={controlClass} name="dealer_id">
            {data.dealers.filter((dealer) => dealer.status === "approved").map((dealer) => (
              <option key={dealer.id} value={dealer.id}>{dealer.business_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Kind">
          <select className={controlClass} name="kind" defaultValue="month">
            <option value="month">Dealer of the Month</option>
            <option value="homepage">Homepage spotlight</option>
          </select>
        </Field>
        <Field label="Label"><input className={controlClass} name="label" placeholder="Dealer of the Month" /></Field>
        <Field label="Starts"><input className={controlClass} type="datetime-local" name="starts_at" required /></Field>
        <Field label="Ends"><input className={controlClass} type="datetime-local" name="ends_at" required /></Field>
        <SubmitButton>Schedule</SubmitButton>
      </form>
      <ul className="grid gap-2">
        {data.spotlights.map((spot) => (
          <li key={spot.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-white p-4 text-sm">
            <span>{spot.label} · {names.get(spot.dealer_id)} · {spot.starts_at.slice(0, 10)} → {spot.ends_at.slice(0, 10)}</span>
            <form action={deleteSpotlightAction}>
              <input type="hidden" name="id" value={spot.id} />
              <SubmitButton size="sm" variant="outline">Remove</SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
