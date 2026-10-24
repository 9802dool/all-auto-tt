import type { Metadata } from "next";
import { Suspense } from "react";
import { fulfillmentAction, paymentDecisionAction } from "@/app/actions/admin";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { firstParam, formatDateTime, formatTTD } from "@/lib/format";

export const metadata: Metadata = { title: "Payments" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function PaymentsPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading payments…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  await requireAdmin();
  const [data, query] = await Promise.all([listEverything(), searchParams]);
  const dealers = new Map(data.dealers.map((dealer) => [dealer.id, dealer.business_name]));
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Payments</h1>
      <p className="text-sm text-muted-foreground">Mark a transfer paid to start the plan, switch on a featured listing, or accept an extra. Rejected transfers do not change the plan.</p>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      {data.payments.length === 0 ? <p>No payments yet.</p> : null}
      <ul className="grid gap-3">
        {data.payments.map((payment) => (
          <li key={payment.id} className="rounded-2xl border border-border bg-white p-4 text-sm">
            <p className="font-semibold">{dealers.get(payment.dealer_id) ?? payment.dealer_id}</p>
            <p>
              {payment.note || payment.plan} · {formatTTD(payment.amount_ttd)} · {payment.method} · {payment.status} · {formatDateTime(payment.created_at)}
            </p>
            {payment.period_end ? <p>Period ends {payment.period_end.slice(0, 10)}</p> : null}
            {payment.receipt_url ? (
              <a className="font-semibold text-orange-ink" href={payment.receipt_url}>Open receipt</a>
            ) : (
              <p className="text-muted-foreground">No receipt uploaded.</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <form action={paymentDecisionAction}>
                <input type="hidden" name="id" value={payment.id} />
                <input type="hidden" name="status" value="paid" />
                <SubmitButton size="sm">Mark paid</SubmitButton>
              </form>
              <form action={paymentDecisionAction}>
                <input type="hidden" name="id" value={payment.id} />
                <input type="hidden" name="status" value="rejected" />
                <SubmitButton size="sm" variant="outline">Reject</SubmitButton>
              </form>
              {payment.kind === "extra" ? (
                <form action={fulfillmentAction} className="flex gap-2">
                  <input type="hidden" name="id" value={payment.id} />
                  <select name="fulfillment" defaultValue={payment.fulfillment ?? "new"} className="h-8 rounded-lg border border-input bg-white px-2 text-sm">
                    <option value="new">New</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                  <SubmitButton size="sm" variant="outline">Update job</SubmitButton>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
