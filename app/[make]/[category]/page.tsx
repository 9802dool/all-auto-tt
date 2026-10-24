import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PartCard } from "@/components/part-card";
import { cachedSearch } from "@/lib/catalog";

export async function generateStaticParams() {
  const { catalog } = await cachedSearch({});
  return catalog.makes.flatMap((make) => catalog.categories.map((category) => ({ make: make.slug, category: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ make: string; category: string }> }): Promise<Metadata> {
  const { make: makeSlug, category: categorySlug } = await params;
  const { catalog } = await cachedSearch({});
  const make = catalog.makes.find((item) => item.slug === makeSlug);
  const category = catalog.categories.find((item) => item.slug === categorySlug);
  if (!make || !category) return { title: "Parts" };
  const title = `Used ${make.name} ${category.seo_name} in Trinidad`;
  return {
    title,
    description: `${title}. Foreign-used and local stock from dealers across Trinidad and Tobago. WhatsApp the dealer and pay on pickup.`,
    alternates: { canonical: `/${make.slug}/${category.slug}` },
  };
}

export default async function MakeCategoryPage({ params }: { params: Promise<{ make: string; category: string }> }) {
  const { make: makeSlug, category: categorySlug } = await params;
  const { catalog } = await cachedSearch({});
  const make = catalog.makes.find((item) => item.slug === makeSlug);
  const category = catalog.categories.find((item) => item.slug === categorySlug);
  if (!make || !category) notFound();
  const { results } = await cachedSearch({ make: make.name, category: category.name, pageSize: 24, sort: "recommended" });
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm text-muted-foreground"><Link href={`/${make.slug}`}>{make.name}</Link></p>
      <h1 className="font-display text-5xl font-extrabold uppercase">Used {make.name} {category.seo_name} in Trinidad</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {results.total} used {make.name} {category.seo_name.toLowerCase()} from dealers in Trinidad and Tobago. Prices are in TTD. Message the dealer on WhatsApp and pay when you collect.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.items.map((part) => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
      {!results.items.length ? (
        <p className="mt-6">None listed right now. <Link className="font-semibold" href="/request">Request a {make.name} part</Link>.</p>
      ) : null}
    </main>
  );
}
