import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { reportDecisionAction } from "@/app/actions/admin";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { firstParam, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Reports" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function ReportsPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading reports…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  await requireAdmin();
  const [data, query] = await Promise.all([listEverything(), searchParams]);
  const parts = new Map(data.parts.map((part) => [part.id, part]));
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Listing reports</h1>
      <p className="text-sm text-muted-foreground">Actioning a report removes the listing from search.</p>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      {data.reports.length === 0 ? <p>No reports.</p> : null}
      <ul className="grid gap-3">
        {data.reports.map((report) => {
          const part = parts.get(report.part_id);
          return (
            <li key={report.id} className="rounded-2xl border border-border bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase">{report.status} · {formatDateTime(report.created_at)}</p>
              <p className="font-semibold">{report.reason}</p>
              {report.details ? <p>{report.details}</p> : null}
              {part ? <Link className="font-semibold text-orange-ink" href={`/parts/${part.slug}`}>{part.title}</Link> : <p>Listing removed.</p>}
              {report.status === "open" ? (
                <div className="mt-2 flex gap-2">
                  <form action={reportDecisionAction}>
                    <input type="hidden" name="id" value={report.id} />
                    <input type="hidden" name="status" value="actioned" />
                    <SubmitButton size="sm">Remove listing</SubmitButton>
                  </form>
                  <form action={reportDecisionAction}>
                    <input type="hidden" name="id" value={report.id} />
                    <input type="hidden" name="status" value="dismissed" />
                    <SubmitButton size="sm" variant="outline">Dismiss</SubmitButton>
                  </form>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
