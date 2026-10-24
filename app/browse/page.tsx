import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdSlot } from "@/components/ad-slot";
import { PartCard } from "@/components/part-card";
import { SearchForm } from "@/components/search-form";
import { getCatalog, searchParts } from "@/lib/data";
import { browseHref, toQuery } from "@/lib/search";

export const metadata = { title: "Browse used parts in Trinidad & Tobago" };

export default function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <Suspense fallback={<p>Loading filters…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Results({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  await connection();
  const query = toQuery(raw);
  const [results, catalog] = await Promise.all([searchParts(query), getCatalog()]);
  const initial = {
    make: query.make,
    model: query.model,
    year: query.year ? String(query.year) : "",
    category: query.category,
    condition: query.condition,
    location: query.location,
    min: query.min ? String(query.min) : "",
    max: query.max ? String(query.max) : "",
    q: query.q,
    sort: query.sort,
  };
  const pages = Math.max(1, Math.ceil(results.total / results.pageSize));
  const hrefQuery = {
    make: query.make,
    model: query.model,
    year: query.year,
    category: query.category,
    condition: query.condition,
    location: query.location,
    min: query.min,
    max: query.max,
    q: query.q,
    sort: query.sort,
  };
  const cards = results.items.flatMap((part, index) => {
    const nodes = [<PartCard key={part.id} part={part} priority={index < 2} />];
    if (index === 3) {
      nodes.push(
        <div key="ad" className="sm:col-span-2 lg:col-span-2">
          <AdSlot placement="search_inline" />
        </div>,
      );
    }
    return nodes;
  });

  return (
    <>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <h1 className="font-display text-4xl leading-none font-bold uppercase">Browse</h1>
        <p className="mt-2 text-sm text-muted-foreground">{results.total} parts. Links keep these filters.</p>
        <div className="mt-4">
          <SearchForm key={JSON.stringify(initial)} catalog={catalog} initial={initial} variant="filters" />
        </div>
        <div className="mt-6 hidden lg:block">
          <AdSlot placement="search_sidebar" />
        </div>
      </aside>
      <section>
        {results.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2">{cards}</div>
        ) : (
          <div className="rounded-3xl border border-dashed bg-white p-8">
            <h2 className="font-display text-3xl font-bold uppercase">No parts match</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try another year or ask the yards. Requests are free.</p>
            <Link href="/request" className="mt-4 inline-flex font-semibold text-orange-ink">Request this part</Link>
          </div>
        )}
        {pages > 1 ? (
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Pagination">
            {Array.from({ length: pages }, (_, index) => index + 1).map((page) => (
              <Link
                key={page}
                href={browseHref(hrefQuery, page)}
                aria-current={page === results.page ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-lg border ${page === results.page ? "border-charcoal bg-charcoal text-white" : "bg-white"}`}
              >
                {page}
              </Link>
            ))}
          </nav>
        ) : null}
      </section>
    </>
  );
}
