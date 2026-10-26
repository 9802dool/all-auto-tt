import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { duplicateAction, featureCheckoutAction, renewAction, statusAction } from "@/app/actions/dealer";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { requireDealer } from "@/lib/auth";
import { plans } from "@/lib/config";
import { dealerDashboard } from "@/lib/data";
import { firstParam, fitment, formatTTD } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Your parts" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function PartsPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading listings…</p>}>
      <PartsBody searchParams={searchParams} />
    </Suspense>
  );
}

async function PartsBody({ searchParams }: { searchParams: Query }) {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const query = await searchParams;
  const dash = await dealerDashboard(dealer.id);
  const cap = dash.limit === Number.POSITIVE_INFINITY ? "unlimited" : String(dash.limit);
  const imported = firstParam(query.ok) === "imported" ? `Created ${firstParam(query.count) || "0"}. Skipped ${firstParam(query.skipped) || "0"} at the plan limit.` : "";
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase">Parts</h1>
          <p className="text-sm text-muted-foreground">
            {dash.used} of {cap} live listings on {plans[dash.plan].name}. Sold and removed parts do not count.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dealer/parts/import" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}>
            CSV upload
          </Link>
          <Link href="/dealer/parts/new" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "inline-flex")}>
            Add a part
          </Link>
        </div>
      </header>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} extra={imported} />
      {dash.parts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white p-6 text-sm">No listings yet. Add one from your phone, or import a CSV.</p>
      ) : (
        <ul className="grid gap-3">
          {dash.parts.map((part) => (
            <li key={part.id} className="grid gap-3 rounded-2xl border border-border bg-white p-3 sm:grid-cols-[88px_1fr]">
              <img src={part.photos[0] || "/parts/workshop.jpg"} alt={part.title} className="aspect-square w-full rounded-xl object-cover sm:size-22" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl leading-none font-bold uppercase">{part.title}</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold uppercase">{part.status}</span>
                  {part.expired ? <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold">Expired</span> : null}
                  {part.featured_now ? <span className="rounded-full bg-orange px-2 py-0.5 text-xs font-bold text-charcoal">Featured</span> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{fitment(part)} · {formatTTD(part.price_ttd)} · {part.location}</p>
                <p className="mt-1 text-sm">
                  {part.views} views · {part.whatsapp_clicks} WhatsApp · {part.call_clicks} calls · {part.inquiry_count} inquiries
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/dealer/parts/${part.id}/edit`} className={cn(buttonVariants({ size: "sm" }), "inline-flex")}>
                    Edit
                  </Link>
                  <Link href={`/parts/${part.slug}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}>
                    Public page
                  </Link>
                  <Mini action={duplicateAction} id={part.id} label="Duplicate" />
                  {part.status !== "sold" && part.status !== "removed" ? (
                    <Mini action={renewAction} id={part.id} label="Still available?" />
                  ) : null}
                  {part.status === "available" ? <Mini action={statusAction} id={part.id} status="reserved" label="Reserve" /> : null}
                  {part.status !== "sold" ? <Mini action={statusAction} id={part.id} status="sold" label="Mark sold" /> : null}
                  {part.status === "sold" || part.status === "reserved" ? (
                    <Mini action={statusAction} id={part.id} status="available" label="Mark available" />
                  ) : null}
                  <form action={featureCheckoutAction}>
                    <input type="hidden" name="part_id" value={part.id} />
                    <SubmitButton variant="accent" size="sm">
                      Feature · TT$50
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Mini({
  action,
  id,
  label,
  status,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  status?: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {status ? <input type="hidden" name="status" value={status} /> : null}
      <SubmitButton variant="outline" size="sm">
        {label}
      </SubmitButton>
    </form>
  );
}
