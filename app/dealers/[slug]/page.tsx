import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import NotFound from "@/app/not-found";
import { Suspense } from "react";
import { ReviewForm } from "@/components/buyer-forms";
import { PartCard } from "@/components/part-card";
import { getCurrentUser } from "@/lib/auth";
import { cachedDealer, cachedSitemap } from "@/lib/catalog";
import { listDealerParts } from "@/lib/data";
import { formatPhone, telLink, waLink } from "@/lib/format";
import { toPublicDealer } from "@/lib/visibility";

export async function generateStaticParams() {
  const entries = await cachedSitemap();
  if (!entries.dealers.length) return [{ slug: "central-foreign-used-parts" }];
  return entries.dealers.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const record = await cachedDealer(slug);
  if (!record || record.dealer.status !== "approved") return { title: "Dealer" };
  return {
    title: `${record.dealer.business_name} used parts`,
    description: record.dealer.about,
  };
}

export default function DealerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="p-8">Loading dealer…</p>}>
      <DealerBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function DealerBody({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = String((await searchParams).category ?? "");
  await connection();
  const record = await cachedDealer(slug);
  const user = record ? await getCurrentUser() : null;
  const owns = Boolean(record && (user?.id === record.dealer.owner_user_id || user?.role === "admin"));
  if (!record || (record.dealer.status !== "approved" && !owns)) return <NotFound />;
  const dealer = toPublicDealer(record.dealer);
  const parts = record.dealer.status === "approved" ? record.parts : await listDealerParts(record.dealer.id);
  const visible = category ? parts.filter((part) => part.category === category) : parts;
  const categories = [...new Set(parts.map((part) => part.category))];
  const map = dealer.lat && dealer.lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${dealer.lng - 0.03}%2C${dealer.lat - 0.02}%2C${dealer.lng + 0.03}%2C${dealer.lat + 0.02}&layer=mapnik&marker=${dealer.lat}%2C${dealer.lng}`
    : null;

  return (
    <main>
      <div className="relative h-48 bg-charcoal sm:h-64">
        {record.dealer.cover ? <img src={record.dealer.cover} alt="" className="h-full w-full object-cover opacity-70" /> : null}
      </div>
      <div className="mx-auto max-w-6xl px-4">
        <div className="-mt-10 rounded-3xl border border-border bg-white p-5">
          {record.dealer.status !== "approved" ? (
            <p className="mb-3 rounded-xl bg-amber-100 px-3 py-2 text-sm">Preview only. Buyers cannot see this shop until it is approved.</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            {dealer.logo ? <img src={dealer.logo} alt="" className="size-16 rounded-2xl" /> : null}
            <div>
              <h1 className="font-display text-4xl font-extrabold uppercase">{dealer.business_name}</h1>
              <p className="text-sm text-muted-foreground">{dealer.region} · {dealer.hours}</p>
              {dealer.verified ? <p className="text-xs font-bold tracking-wide text-orange-ink uppercase">Verified dealer</p> : null}
              {dealer.rating_count ? <p className="text-sm">{dealer.rating_avg} / 5 from {dealer.rating_count} reviews</p> : <p className="text-sm">No reviews yet</p>}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6">{dealer.about}</p>
          <p className="mt-2 text-sm">{dealer.address}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a className="inline-flex h-11 items-center rounded-xl bg-whatsapp px-4 font-semibold text-white" href={waLink(dealer.whatsapp, `Hi ${dealer.business_name}, I saw your storefront on ALL AUTO TT.`)}>WhatsApp</a>
            <a className="inline-flex h-11 items-center rounded-xl bg-charcoal px-4 font-semibold text-white" href={telLink(dealer.phone)}>Call {formatPhone(dealer.phone)}</a>
            <a className="inline-flex h-11 items-center rounded-xl border px-4 font-semibold" href={`/api/dealers/${dealer.slug}/flyer`}>Download flyer</a>
          </div>
        </div>

        {map ? (
          <iframe title={`Map of ${dealer.business_name}`} src={map} className="mt-6 h-64 w-full rounded-3xl border border-border" loading="lazy" />
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href={`/dealers/${dealer.slug}`} className={`rounded-full px-3 py-1 text-sm ${!category ? "bg-charcoal text-white" : "bg-white"}`}>All</Link>
          {categories.map((item) => (
            <Link key={item} href={`/dealers/${dealer.slug}?category=${encodeURIComponent(item)}`} className={`rounded-full px-3 py-1 text-sm ${category === item ? "bg-charcoal text-white" : "bg-white"}`}>{item}</Link>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.length ? visible.map((part) => <PartCard key={part.id} part={part} />) : <p>No listings in this filter.</p>}
        </div>

        <section className="mt-10 grid gap-6 pb-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase">Reviews</h2>
            <div className="mt-3 space-y-3">
              {record.reviews.map((review) => (
                <article key={review.id} className="rounded-2xl bg-white p-4">
                  <p className="font-semibold">{review.name} · {review.rating}/5</p>
                  <p className="text-sm">{review.comment}</p>
                </article>
              ))}
              {!record.reviews.length ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : null}
            </div>
          </div>
          {record.dealer.status === "approved" ? (
            <div className="rounded-3xl border border-border bg-white p-5">
              <h2 className="text-xl font-semibold">Rate this dealer</h2>
              <div className="mt-3"><ReviewForm dealerId={dealer.id} /></div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
