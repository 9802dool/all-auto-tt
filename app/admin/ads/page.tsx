import type { Metadata } from "next";
import { Suspense } from "react";
import { adAction, deleteAdAction } from "@/app/actions/admin";
import { Flash } from "@/components/flash";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { firstParam } from "@/lib/format";

export const metadata: Metadata = { title: "Ads" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function AdsPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading ads…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  await requireAdmin();
  const [data, query] = await Promise.all([listEverything(), searchParams]);
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Banner ads</h1>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <form action={adAction} className="grid gap-3 rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">New ad</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title"><input className={controlClass} name="title" required /></Field>
          <Field label="Advertiser"><input className={controlClass} name="advertiser" required /></Field>
          <Field label="Link"><input className={controlClass} name="link" required placeholder="https://" /></Field>
          <Field label="Image path or URL" hint="Or upload a file. Wide images work best.">
            <input className={controlClass} name="image" placeholder="/ads/trini-tyre.svg" />
          </Field>
          <Field label="Upload image"><input className={controlClass} name="image_file" type="file" accept="image/*" /></Field>
          <Field label="Placement">
            <select className={controlClass} name="placement" defaultValue="homepage">
              <option value="homepage">Homepage</option>
              <option value="search_inline">Between search results</option>
              <option value="search_sidebar">Search sidebar</option>
              <option value="part_page">Part page</option>
            </select>
          </Field>
          <Field label="Starts"><input className={controlClass} type="datetime-local" name="starts_at" required /></Field>
          <Field label="Ends"><input className={controlClass} type="datetime-local" name="ends_at" required /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="active" defaultChecked className="size-4" /> Active
        </label>
        <SubmitButton>Save ad</SubmitButton>
      </form>
      <ul className="grid gap-3">
        {data.ads.map((ad) => (
          <li key={ad.id} className="rounded-2xl border border-border bg-white p-4 text-sm">
            <p className="font-semibold">{ad.title}</p>
            <p className="text-muted-foreground">{ad.advertiser} · {ad.placement} · {ad.impressions} impressions · {ad.clicks} clicks · {ad.active ? "active" : "off"}</p>
            <p>{ad.starts_at.slice(0, 10)} → {ad.ends_at.slice(0, 10)}</p>
            <form action={deleteAdAction} className="mt-2">
              <input type="hidden" name="id" value={ad.id} />
              <SubmitButton size="sm" variant="outline">Remove</SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
