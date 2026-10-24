import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Flash } from "@/components/flash";
import { PartForm } from "@/components/part-form";
import { ShareKit } from "@/components/share-kit";
import { requireDealer } from "@/lib/auth";
import { categories, conditions, regions, transmissions } from "@/lib/config";
import { dealerDashboard, getCatalog } from "@/lib/data";
import { firstParam, years } from "@/lib/format";

export const metadata: Metadata = { title: "Edit part" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function EditPartPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading the listing…</p>}>
      <Body params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Query }) {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const [{ id }, query, dash, catalog] = await Promise.all([params, searchParams, dealerDashboard(dealer.id), getCatalog()]);
  const part = dash.parts.find((item) => item.id === id);
  if (!part) notFound();
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Edit part</h1>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <div className="rounded-3xl border border-border bg-white p-4">
        <PartForm
          part={part}
          catalog={{
            categories: catalog.categories.length ? catalog.categories : categories.map((item) => ({ name: item.name })),
            makes: catalog.makes,
            models: catalog.models,
          }}
          regions={regions.map((region) => region.name)}
          conditions={conditions}
          transmissions={transmissions}
          years={years()}
          location={dealer.region}
        />
      </div>
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">Share this part</h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">Square is 1080×1080. Story is 1080×1920. Both carry the photo, price, dealer and ALL AUTO mark.</p>
        <ShareKit slug={part.slug} title={part.title} />
      </section>
    </>
  );
}
