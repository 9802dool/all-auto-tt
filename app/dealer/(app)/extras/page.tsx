import type { Metadata } from "next";
import { Suspense } from "react";
import { extraCheckoutAction } from "@/app/actions/dealer";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { requireDealer } from "@/lib/auth";
import { extras } from "@/lib/config";
import { firstParam, formatTTD } from "@/lib/format";

export const metadata: Metadata = { title: "Paid extras" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function ExtrasPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading extras…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const query = await searchParams;
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Paid extras</h1>
      <p className="text-sm text-muted-foreground">Order help from ALL AUTO TT. The order lands with the admin after you upload the bank receipt.</p>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {extras.map((extra) => (
          <form key={extra.id} action={extraCheckoutAction} className="rounded-3xl border border-border bg-white p-4">
            <h2 className="font-display text-2xl font-bold uppercase">{extra.name}</h2>
            <p className="font-display text-3xl font-extrabold">{formatTTD(extra.price)}</p>
            <p className="mt-2 text-sm">{extra.detail}</p>
            <input type="hidden" name="extra" value={extra.id} />
            <SubmitButton className="mt-4" variant="accent">
              Order
            </SubmitButton>
          </form>
        ))}
      </div>
    </>
  );
}
