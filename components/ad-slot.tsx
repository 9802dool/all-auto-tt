import { AdBeacon } from "@/components/view-beacon";
import { cachedAds } from "@/lib/catalog";
import type { AdPlacement } from "@/lib/types";

export async function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const ads = await cachedAds(placement);
  const ad = ads[0];
  if (!ad) return null;
  return (
    <aside className={className} aria-label="Advertisement">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Ad</p>
      <a href={`/api/ads/${ad.id}/click`} className="block overflow-hidden rounded-2xl border border-border bg-white">
        <img src={ad.image} alt={ad.title} className="aspect-[12/3] w-full object-cover" />
      </a>
      <AdBeacon adId={ad.id} />
    </aside>
  );
}
