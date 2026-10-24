import type { Metadata } from "next";
import { Suspense } from "react";
import { dealerPlanAction, dealerStatusAction } from "@/app/actions/admin";
import { Flash } from "@/components/flash";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { firstParam, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dealers" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function AdminDealersPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading dealers…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  await requireAdmin();
  const [data, query] = await Promise.all([listEverything(), searchParams]);
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Dealers</h1>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <ul className="grid gap-3">
        {data.dealers.map((dealer) => (
          <li key={dealer.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-bold uppercase">{dealer.business_name}</h2>
              <p className="text-xs font-semibold uppercase">{dealer.status}{dealer.verified ? " · verified" : ""} · {dealer.plan}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {dealer.contact_name} · {dealer.region} · {dealer.email} · {dealer.listings} listings
              {dealer.example ? " · sample" : ""}
            </p>
            <p className="text-sm">Plan ends {formatDate(dealer.plan_expires_at)}</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <form action={dealerStatusAction} className="grid gap-2">
                <input type="hidden" name="id" value={dealer.id} />
                <Field label="Status">
                  <select className={controlClass} name="status" defaultValue={dealer.status}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                    <option value="removed">Removed</option>
                  </select>
                </Field>
                <Field label="Verified badge">
                  <select className={controlClass} name="verified" defaultValue="">
                    <option value="">Keep current</option>
                    <option value="true">Verified</option>
                    <option value="false">Not verified</option>
                  </select>
                </Field>
                <SubmitButton size="sm">Save status</SubmitButton>
              </form>
              <form action={dealerPlanAction} className="grid gap-2">
                <input type="hidden" name="id" value={dealer.id} />
                <Field label="Plan">
                  <select className={controlClass} name="plan" defaultValue={dealer.plan}>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                </Field>
                <Field label="Expiry" hint="Leave empty for Free.">
                  <input className={controlClass} type="date" name="expires" defaultValue={dealer.plan_expires_at?.slice(0, 10) ?? ""} />
                </Field>
                <SubmitButton size="sm" variant="outline">Set plan</SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
