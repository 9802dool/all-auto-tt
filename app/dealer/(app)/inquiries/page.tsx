import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { readInquiryAction } from "@/app/actions/dealer";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { requireDealer } from "@/lib/auth";
import { dealerDashboard } from "@/lib/data";
import { firstParam, formatDateTime, formatPhone, waLink } from "@/lib/format";

export const metadata: Metadata = { title: "Inquiries" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function InquiriesPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading inbox…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const [dash, query] = await Promise.all([dealerDashboard(dealer.id), searchParams]);
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Inquiries</h1>
      <Flash ok={firstParam(query.ok)} />
      {dash.inquiries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white p-6 text-sm">No form inquiries yet. WhatsApp and call clicks still show on each part.</p>
      ) : (
        <ul className="grid gap-3">
          {dash.inquiries.map((item) => {
            const part = dash.parts.find((entry) => entry.id === item.part_id);
            return (
              <li key={item.id} className="rounded-2xl border border-border bg-white p-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {item.read ? "Read" : "New"} · {formatDateTime(item.created_at)}
                </p>
                <h2 className="mt-1 font-semibold">{item.name}</h2>
                <p className="text-sm">{formatPhone(item.phone)}</p>
                <p className="mt-2 text-sm">{item.message}</p>
                {part ? (
                  <Link href={`/parts/${part.slug}`} className="mt-2 inline-block text-sm font-semibold text-orange-ink">
                    {part.title}
                  </Link>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="inline-flex h-8 items-center rounded-lg bg-whatsapp px-3 text-sm font-semibold text-white" href={waLink(item.phone, `Hi ${item.name}, this is ${dealer.business_name} about your ALL AUTO TT inquiry.`)}>
                    Reply on WhatsApp
                  </a>
                  {!item.read ? (
                    <form action={readInquiryAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <SubmitButton size="sm" variant="outline">
                        Mark read
                      </SubmitButton>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
