import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import NotFound from "@/app/not-found";
import { AdSlot } from "@/components/ad-slot";
import { InquiryForm, ReportButton } from "@/components/buyer-forms";
import { ContactActions } from "@/components/contact-actions";
import { Gallery } from "@/components/gallery";
import { PartCard } from "@/components/part-card";
import { ViewBeacon } from "@/components/view-beacon";
import { cachedPart, cachedSitemap } from "@/lib/catalog";
import { categoryByName, siteUrl, slugifyMake } from "@/lib/config";
import { excerpt, fitment, formatPhone, formatTTD, partMetaTitle } from "@/lib/format";

export async function generateStaticParams() {
  const entries = await cachedSitemap();
  if (!entries.parts.length) return [{ slug: "2014-toyota-axio-gearbox" }];
  return entries.parts.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await cachedPart(slug);
  if (!detail) return { title: "Part not found" };
  const title = partMetaTitle(detail.part);
  const description = excerpt(detail.part.description);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/parts/${slug}` },
    openGraph: {
      title,
      description,
      images: detail.part.photos[0] ? [detail.part.photos[0]] : ["/parts/hero.jpg"],
    },
  };
}

export default function PartPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="p-8">Loading part…</p>}>
      <PartBody params={params} />
    </Suspense>
  );
}

async function PartBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await cachedPart(slug);
  if (!detail) return <NotFound />;
  const { part, similar, reviews } = detail;
  const category = categoryByName(part.category);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: part.title,
    description: part.description,
    image: part.photos.map((photo) => (photo.startsWith("http") ? photo : `${siteUrl()}${photo}`)),
    brand: { "@type": "Brand", name: part.make },
    category: part.category,
    itemCondition: part.condition === "Refurbished" ? "https://schema.org/RefurbishedCondition" : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "TTD",
      price: part.price_ttd.toFixed(2),
      availability:
        part.status === "available"
          ? "https://schema.org/InStock"
          : part.status === "reserved"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/OutOfStock",
      areaServed: "Trinidad and Tobago",
      seller: { "@type": "AutoDealer", name: part.dealer.business_name, address: part.dealer.address },
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ViewBeacon partId={part.id} />
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span> / </span>
        <Link href={`/${slugifyMake(part.make)}`}>{part.make}</Link>
        {category ? (
          <>
            <span> / </span>
            <Link href={`/${slugifyMake(part.make)}/${category.slug}`}>{category.seoName}</Link>
          </>
        ) : null}
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Gallery photos={part.photos} title={part.title} />
        <div>
          {part.example ? <p className="text-xs font-bold tracking-wide text-orange-ink uppercase">Sample listing</p> : null}
          <h1 className="font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">{part.title}</h1>
          <p className="mt-3 text-lg">{fitment(part)}</p>
          <p className="mt-2 font-display text-5xl font-bold">{formatTTD(part.price_ttd)}</p>
          {part.negotiable ? <p className="text-sm text-muted-foreground">Price is negotiable. Ask on WhatsApp.</p> : null}
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Condition</dt><dd className="font-semibold">{part.condition}</dd></div>
            <div><dt className="text-muted-foreground">Location</dt><dd className="font-semibold">{part.location}</dd></div>
            <div><dt className="text-muted-foreground">Engine code</dt><dd className="font-semibold">{part.engine_code || "—"}</dd></div>
            <div><dt className="text-muted-foreground">Transmission</dt><dd className="font-semibold">{part.transmission_type}</dd></div>
          </dl>
          <div className="mt-5 hidden md:block">
            <ContactActions partId={part.id} title={part.title} slug={part.slug} phone={part.dealer.phone} whatsapp={part.dealer.whatsapp} />
          </div>
          <p className="mt-4 rounded-2xl bg-orange/15 px-4 py-3 text-sm">
            Pay on pickup — inspect before you buy. Meet at the dealer&apos;s business address. ALL AUTO TT does not take payment for the part.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <h2 className="font-display text-3xl font-bold uppercase">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-7">{part.description}</p>
          <div className="mt-6">
            <ReportButton partId={part.id} />
          </div>
        </section>
        <aside className="rounded-3xl border border-border bg-white p-5">
          <div className="flex items-center gap-3">
            {part.dealer.logo ? <img src={part.dealer.logo} alt={`${part.dealer.business_name} logo`} className="size-14 rounded-xl" /> : null}
            <div>
              <h2 className="text-lg font-semibold">{part.dealer.business_name}</h2>
              <p className="text-sm text-muted-foreground">{part.dealer.region}</p>
              {part.dealer.verified ? <p className="text-xs font-bold tracking-wide text-orange-ink uppercase">Verified dealer</p> : null}
            </div>
          </div>
          <p className="mt-3 text-sm">{part.dealer.rating_count ? `${part.dealer.rating_avg} / 5 from ${part.dealer.rating_count} reviews` : "No reviews yet"}</p>
          <p className="mt-2 text-sm">{part.dealer.address}</p>
          <p className="text-sm">{formatPhone(part.dealer.phone)}</p>
          <Link href={`/dealers/${part.dealer.slug}`} className="mt-3 inline-flex text-sm font-semibold text-orange-ink">View storefront</Link>
          <div className="mt-5">
            <h3 className="font-semibold">Inquiry form</h3>
            <div className="mt-3">
              <InquiryForm partId={part.id} />
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <AdSlot placement="part_page" />
      </div>

      {reviews.length ? (
        <section className="mt-8">
          <h2 className="font-display text-3xl font-bold uppercase">Dealer reviews</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl bg-white p-4">
                <p className="font-semibold">{review.name} · {review.rating}/5</p>
                <p className="mt-1 text-sm">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {similar.length ? (
        <section className="mt-10">
          <h2 className="font-display text-3xl font-bold uppercase">Similar parts</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((item) => (
              <PartCard key={item.id} part={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white p-3 md:hidden">
        <ContactActions partId={part.id} title={part.title} slug={part.slug} phone={part.dealer.phone} whatsapp={part.dealer.whatsapp} />
      </div>
    </main>
  );
}
