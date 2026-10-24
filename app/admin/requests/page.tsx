import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { formatDateTime, formatPhone, waLink } from "@/lib/format";

export const metadata: Metadata = { title: "Part requests" };

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<p>Loading requests…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  await requireAdmin();
  const data = await listEverything();
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Part requests</h1>
      <p className="text-sm text-muted-foreground">Buyers posted these. Matching paid dealers were emailed the phone number. Free dealers got a teaser.</p>
      {data.requests.length === 0 ? <p>No requests yet.</p> : null}
      <ul className="grid gap-3">
        {data.requests.map((request) => (
          <li key={request.id} className="rounded-2xl border border-border bg-white p-4 text-sm">
            <p className="text-xs font-semibold uppercase">{formatDateTime(request.created_at)}</p>
            <h2 className="font-display text-2xl font-bold uppercase">{request.year} {request.make} {request.model} · {request.part}</h2>
            <p>{request.name} · {formatPhone(request.phone)}</p>
            {request.notes ? <p className="text-muted-foreground">{request.notes}</p> : null}
            <a className="mt-2 inline-flex h-8 items-center rounded-lg bg-whatsapp px-3 text-xs font-semibold text-white" href={waLink(request.phone)}>
              WhatsApp buyer
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
