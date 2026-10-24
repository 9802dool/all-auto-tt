import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { CategoryIcon } from "@/components/category-icon";
import { PartCard } from "@/components/part-card";
import { SearchForm } from "@/components/search-form";
import { buttonVariants } from "@/components/ui/button";
import { cachedHome } from "@/lib/catalog";
import { brand, popularMakes, slugifyMake } from "@/lib/config";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const { home, catalog } = await cachedHome();
  return (
    <main>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <img src="/parts/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="font-display text-sm tracking-[0.2em] text-orange uppercase">Used parts · Trinidad & Tobago</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-7xl">
            Every part. Every dealer.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-100">
            {brand.tagline} Search scrapyards, foreign-used importers and parts shops. WhatsApp the dealer, inspect the part, pay on pickup.
          </p>
          <div className="mt-8 rounded-3xl bg-white p-4 text-charcoal shadow-xl sm:p-6">
            <SearchForm catalog={catalog} variant="hero" />
          </div>
          <p className="mt-4 text-sm text-zinc-200">
            {home.partCount} parts from {home.dealerCount} dealers in the sample yard. You are not buying from ALL AUTO TT.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-3xl font-bold tracking-tight uppercase">Popular categories</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {catalog.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/browse?category=${encodeURIComponent(category.name)}`}
              className="grid justify-items-center gap-2 rounded-2xl border border-border bg-white px-2 py-4 text-center text-xs font-semibold hover:border-orange"
            >
              <CategoryIcon name={category.icon} className="size-6 text-orange-ink" />
              {category.seo_name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-bold tracking-tight uppercase">Featured parts</h2>
          <Link href="/browse" className="text-sm font-semibold text-orange-ink">See all</Link>
        </div>
        {home.featured.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.featured.map((part, index) => (
              <PartCard key={part.id} part={part} priority={index < 2} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed p-6 text-muted-foreground">No featured parts right now.</p>
        )}
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <AdSlot placement="homepage" />
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tight uppercase">Latest arrivals</h2>
          <Link href="/new" className="text-sm font-semibold text-orange-ink">New arrivals feed</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {home.latest.slice(0, 4).map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
          <h2 className="font-display text-3xl font-bold uppercase md:col-span-3">How it works</h2>
          {[
            ["1", "Find your part", "Filter by make, model, year and category across every approved dealer."],
            ["2", "WhatsApp the dealer", "Message or call the shop directly. ALL AUTO TT does not sit in the middle of the sale."],
            ["3", "Inspect and pay on pickup", "Look at the part at the dealer's address, then pay them. No checkout on this site."],
          ].map(([step, title, copy]) => (
            <article key={step} className="rounded-2xl border border-border p-5">
              <p className="font-display text-5xl font-extrabold text-orange">{step}</p>
              <h3 className="mt-2 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {home.month ? (
          <div className="mb-6 rounded-3xl bg-charcoal p-6 text-white sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-orange uppercase">{home.month.label}</p>
              <h2 className="mt-1 font-display text-4xl font-bold uppercase">{home.month.dealer.business_name}</h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-300">{home.month.dealer.about}</p>
            </div>
            <Link href={`/dealers/${home.month.dealer.slug}`} className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-4 inline-flex sm:mt-0")}>
              Visit the yard
            </Link>
          </div>
        ) : null}
        <h2 className="font-display text-3xl font-bold uppercase">Featured dealers</h2>
        <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2">
          {home.dealers.map((dealer) => (
            <Link key={dealer.id} href={`/dealers/${dealer.slug}`} className="w-72 shrink-0 snap-start rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center gap-3">
                {dealer.logo ? <img src={dealer.logo} alt="" className="size-12 rounded-xl" /> : null}
                <div>
                  <p className="font-semibold">{dealer.business_name}</p>
                  <p className="text-sm text-muted-foreground">{dealer.region}</p>
                </div>
              </div>
              {dealer.verified ? <p className="mt-3 text-xs font-bold tracking-wide text-orange-ink uppercase">Verified dealer</p> : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-3xl border border-orange/40 bg-orange/10 px-6 py-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold uppercase">Are you a parts dealer?</h2>
            <p className="mt-2 max-w-xl text-sm">List your stock, get WhatsApp leads, and keep the payment on pickup. Plans start free.</p>
          </div>
          <Link href="/for-dealers" className={cn(buttonVariants({ variant: "accent", size: "xl" }), "mt-4 inline-flex")}>
            List your parts
          </Link>
        </div>
        <h2 className="mt-10 font-display text-3xl font-bold uppercase">Popular makes</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {popularMakes.map((make) => (
            <Link key={make} href={`/${slugifyMake(make)}`} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold hover:border-orange">
              {make}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
