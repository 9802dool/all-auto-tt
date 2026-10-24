import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireDealer } from "@/lib/auth";
import { dealerDashboard } from "@/lib/data";
import { plans } from "@/lib/config";
import { formatTTD } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dealer dashboard" };

export default function DealerHome() {
  return (
    <Suspense fallback={<p>Loading stats…</p>}>
      <HomeBody />
    </Suspense>
  );
}

async function HomeBody() {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const dash = await dealerDashboard(dealer.id);
  const cap = dash.limit === Number.POSITIVE_INFINITY ? "Unlimited" : String(dash.limit);
  const plan = plans[dash.plan];
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase">Yard overview</h1>
          <p className="text-sm text-muted-foreground">
            {plan.name} plan · {dash.used} of {cap} live listings
            {dealer.plan_expires_at ? ` · renews or ends ${dealer.plan_expires_at.slice(0, 10)}` : ""}
          </p>
        </div>
        <Link href="/dealer/parts/new" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "inline-flex")}>
          Add a part
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Views" value={dash.leads.views} />
        <Stat label="WhatsApp clicks" value={dash.leads.whatsapp} />
        <Stat label="Calls" value={dash.leads.calls} />
        <Stat label="Inquiries" value={dash.leads.forms} />
      </div>
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">Plan</h2>
        <p className="mt-2 text-sm">
          {plan.name} is {plan.price ? `${formatTTD(plan.price)} per month` : "free"}. Pro is {formatTTD(plans.pro.price)} for 150 listings and lead stats. Premium is {formatTTD(plans.premium.price)} with unlimited listings and search priority.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dealer/billing" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
            Upgrade
          </Link>
          <Link href={`/dealers/${dealer.slug}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}>
            View storefront
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-display text-4xl font-extrabold">{value}</p>
    </div>
  );
}
