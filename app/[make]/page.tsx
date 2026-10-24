import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PartCard } from "@/components/part-card";
import { cachedSearch } from "@/lib/catalog";
import { slugifyMake } from "@/lib/config";

export async function generateStaticParams() {
  const { catalog } = await cachedSearch({});
  return catalog.makes.map((make) => ({ make: make.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ make: string }> }): Promise<Metadata> {
  const { make: slug } = await params;
  const { catalog } = await cachedSearch({});
  const make = catalog.makes.find((item) => item.slug === slug);
  if (!make) return { title: "Parts" };
  return {
    title: `Used ${make.name} parts in Trinidad`,
    description: `Used and foreign-used ${make.name} parts from dealers across Trinidad and Tobago. Engines, gearboxes and body parts, with WhatsApp contact and pay on pickup.`,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function MakePage({ params }: { params: Promise<{ make: string }> }) {
  const { make: slug } = await params;
  const { catalog, results } = await cachedSearch({ make: undefined, pageSize: 24 });
  const make = catalog.makes.find((item) => item.slug === slug);
  if (!make) notFound();
  const parts = (await cachedSearch({ make: make.name, pageSize: 24, sort: "recommended" })).results;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Used {make.name} parts in Trinidad</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {parts.total} used {make.name} parts listed by dealers in Trinidad and Tobago. Compare the price in TTD, WhatsApp the yard, and pay on pickup after you inspect it.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {catalog.categories.map((category) => (
          <Link key={category.slug} href={`/${make.slug}/${category.slug}`} className="rounded-full bg-white px-3 py-1 text-sm font-semibold">
            {category.seo_name}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {parts.items.map((part) => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
      {!parts.items.length ? <p className="mt-6">No {make.name} parts are live right now. <Link href="/request" className="font-semibold">Request one</Link>.</p> : null}
      <p className="sr-only">{results.total} {slugifyMake(make.name)}</p>
    </main>
  );
}
