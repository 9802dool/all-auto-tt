import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdSlot } from "@/components/ad-slot";
import { PartCard } from "@/components/part-card";
import { RequestPartButton } from "@/components/request-part-button";
import { SearchForm } from "@/components/search-form";
import { brand } from "@/lib/config";
import { getCatalog, searchParts } from "@/lib/data";
import { formatPhone } from "@/lib/format";
import { browseHref, toQuery } from "@/lib/search";
import type { PartQuery } from "@/lib/types";

export const metadata = {
  title: "Browse used parts in Trinidad & Tobago",
  description:
    "Search engines, gearboxes, body parts and more from scrapyards and foreign-used dealers across Trinidad and Tobago. WhatsApp the dealer and pay on pickup.",
};

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
  const requestSearch = {
    make: query.make,
    model: query.model,
    year: query.year,
    part: query.category,
    keywords: query.q,
  };
  const summary = searchSummary(query);
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
      <section className={results.items.length ? undefined : "max-lg:order-first"}>
        {results.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2">{cards}</div>
        ) : (
          <div className="rounded-3xl border border-dashed border-orange bg-white p-6 sm:p-8">
            <h2 className="font-display text-3xl font-bold uppercase text-charcoal">No parts match</h2>
            {summary ? <p className="mt-2 font-medium text-charcoal">{summary}</p> : null}
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing listed matches this search. Request it on WhatsApp and ALL AUTO TT will ask the yards.
            </p>
            <div className="mt-5">
              <RequestPartButton search={requestSearch} prominent />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Opens WhatsApp to {formatPhone(brand.whatsapp)} with your make, model, year, part, and keywords filled in.
            </p>
            <Link href={requestHref(query)} className="mt-4 inline-flex text-sm font-semibold text-orange-ink">
              Or post a request on the site
            </Link>
          </div>
        )}
        {results.items.length ? (
          <div className="mt-6 rounded-2xl border border-border bg-white p-4">
            <p className="text-sm font-medium text-charcoal">Not seeing the right part?</p>
            <div className="mt-3">
              <RequestPartButton search={requestSearch} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              WhatsApp {formatPhone(brand.whatsapp)} with this search filled in.
            </p>
          </div>
        ) : null}
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

function searchSummary(query: PartQuery) {
  return [query.q, query.year ? String(query.year) : "", query.make, query.model, query.category].filter(Boolean).join(" · ");
}

function requestHref(query: PartQuery) {
  const params = new URLSearchParams();
  if (query.make) params.set("make", query.make);
  if (query.model) params.set("model", query.model);
  if (query.year) params.set("year", String(query.year));
  if (query.category) params.set("part", query.category);
  if (query.q) params.set("notes", query.q);
  const qs = params.toString();
  return qs ? `/request?${qs}` : "/request";
}
