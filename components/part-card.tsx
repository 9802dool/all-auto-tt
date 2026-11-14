import Link from "next/link";
import { PartImage } from "@/components/part-image";
import { SampleBadge } from "@/components/sample-badge";
import { fitment, formatTTD } from "@/lib/format";
import type { ListedPart } from "@/lib/types";

const conditionClass: Record<string, string> = {
  "Foreign-used": "bg-emerald-700 text-white",
  Used: "bg-amber-300 text-zinc-950",
  New: "bg-sky-800 text-white",
  "Used – Tested": "bg-emerald-700 text-white",
  "Used – Untested": "bg-amber-300 text-zinc-950",
  Refurbished: "bg-sky-800 text-white",
};

export function PartCard({ part, priority = false }: { part: ListedPart; priority?: boolean }) {
  const photo = part.photos[0];
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <Link href={`/parts/${part.slug}`} className="block focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring">
        <div className="relative aspect-[4/3] bg-muted">
          {photo ? (
            <PartImage src={photo} alt={`${part.title} photo`} priority={priority} sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No photo</div>
          )}
          <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${conditionClass[part.condition] ?? "bg-white"}`}>
            {part.condition}
          </span>
          {part.featured_now ? (
            <span className="absolute top-3 right-3 rounded-full bg-orange px-2.5 py-1 text-xs font-bold text-charcoal">Featured</span>
          ) : null}
          {part.status !== "available" ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-charcoal px-2.5 py-1 text-xs font-semibold tracking-wide text-white uppercase">
              {part.status}
            </span>
          ) : null}
          {part.example || part.dealer.example ? (
            <span className="absolute bottom-3 right-3">
              <SampleBadge />
            </span>
          ) : null}
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-display text-2xl leading-none font-bold tracking-tight text-charcoal uppercase">{part.title}</h3>
          <p className="text-sm text-muted-foreground">{fitment(part)}</p>
          <p className="font-display text-3xl leading-none font-bold">{formatTTD(part.price_ttd)}</p>
          <p className="text-sm">
            {part.negotiable ? "Nearest offer · " : ""}
            {part.location}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Link href={`/dealers/${part.dealer.slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-orange-ink">
          {part.dealer.business_name}
        </Link>
      </div>
    </article>
  );
}
