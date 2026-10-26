import type { Metadata } from "next";
import { Suspense } from "react";
import { planCheckoutAction } from "@/app/actions/dealer";
import { Flash } from "@/components/flash";
import { ReceiptForm } from "@/components/receipt-form";
import { SubmitButton } from "@/components/submit-button";
import { requireDealer } from "@/lib/auth";
import { bank, plans } from "@/lib/config";
import { dealerDashboard } from "@/lib/data";
import { firstParam, formatDate, formatTTD } from "@/lib/format";
import { getSignedReceiptUrl } from "@/lib/uploads";

export const metadata: Metadata = { title: "Plan and receipts" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function BillingPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading billing…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const [dash, query] = await Promise.all([dealerDashboard(dealer.id), searchParams]);
  const pending = dash.payments.filter((payment) => payment.status === "pending");
  
  // Generate signed URLs for receipts owned by this dealer
  const paymentsWithSignedUrls = await Promise.all(
    dash.payments.map(async (payment) => ({
      ...payment,
      signedReceiptUrl: await getSignedReceiptUrl(payment.receipt_url),
    }))
  );
  
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Plan and receipts</h1>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <section className="rounded-3xl border border-border bg-white p-4">
        <p className="text-sm text-muted-foreground">Current plan</p>
        <p className="font-display text-3xl font-extrabold uppercase">{plans[dash.plan].name}</p>
        <p className="text-sm">
          {dealer.plan !== "free" && dealer.plan_expires_at
            ? `Paid through ${formatDate(dealer.plan_expires_at)}. If that date passes, the shop drops to Free until a new receipt is marked paid.`
            : "Free includes 10 live listings. Bank transfer is the payment method in this version."}
        </p>
        <p className="mt-3 text-sm">
          Card checkout is wired as a later provider. WiPay is not switched on, so the button below records a bank transfer instead of charging a card.
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        {(["pro", "premium"] as const).map((id) => (
          <form key={id} action={planCheckoutAction} className="rounded-3xl border border-border bg-white p-4">
            <h2 className="font-display text-2xl font-bold uppercase">{plans[id].name}</h2>
            <p className="font-display text-3xl font-extrabold">{formatTTD(plans[id].price)}<span className="text-base font-semibold">/mo</span></p>
            <ul className="mt-2 list-disc pl-4 text-sm">
              {plans[id].perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <input type="hidden" name="plan" value={id} />
            <SubmitButton className="mt-4" variant="accent">
              Request {plans[id].name}
            </SubmitButton>
          </form>
        ))}
      </section>
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">Bank transfer</h2>
        <dl className="mt-2 grid gap-1 text-sm">
          <div><dt className="inline font-semibold">Bank: </dt><dd className="inline">{bank.bank}</dd></div>
          <div><dt className="inline font-semibold">Name: </dt><dd className="inline">{bank.name}</dd></div>
          <div><dt className="inline font-semibold">Account: </dt><dd className="inline">{bank.account}</dd></div>
          <div><dt className="inline font-semibold">Type: </dt><dd className="inline">{bank.type}</dd></div>
        </dl>
        <p className="mt-2 text-sm text-muted-foreground">{bank.note}</p>
      </section>
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">Upload a receipt</h2>
        <ReceiptForm
          selected={firstParam(query.payment)}
          payments={pending.map((payment) => ({
            id: payment.id,
            label: `${payment.note || payment.plan} · ${formatTTD(payment.amount_ttd)} · ${payment.status}`,
          }))}
        />
      </section>
      <section>
        <h2 className="font-display text-2xl font-bold uppercase">History</h2>
        {paymentsWithSignedUrls.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {paymentsWithSignedUrls.map((payment) => (
              <li key={payment.id} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm">
                <span className="font-semibold">{payment.note || payment.plan}</span> · {formatTTD(payment.amount_ttd)} · {payment.status}
                {payment.signedReceiptUrl ? (
                  <>
                    {" "}
                    · <a className="font-semibold text-orange-ink" href={payment.signedReceiptUrl} target="_blank" rel="noopener noreferrer">Receipt</a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
