import type { Metadata } from "next";
import { Suspense } from "react";
import { remindAction, sendEmailAction } from "@/app/actions/admin";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { firstParam, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Emails" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function EmailsPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading the outbox…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  await requireAdmin();
  const [data, query] = await Promise.all([listEverything(), searchParams]);
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Emails</h1>
      <p className="text-sm text-muted-foreground">
        Queue listing-expiry and plan-renewal reminders, then send them. Without a Resend key they are marked logged so you can copy them.
      </p>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <div className="flex flex-wrap gap-2">
        <form action={remindAction}>
          <SubmitButton>Queue renewal reminders</SubmitButton>
        </form>
        <form action={sendEmailAction}>
          <SubmitButton variant="accent">Send queued mail</SubmitButton>
        </form>
      </div>
      {data.emails.length === 0 ? <p className="text-sm">The outbox is empty.</p> : null}
      <ul className="grid gap-3">
        {data.emails.map((email) => (
          <li key={email.id} className="rounded-2xl border border-border bg-white p-4 text-sm">
            <p className="text-xs font-semibold uppercase">{email.status} · {email.kind} · {formatDateTime(email.created_at)}</p>
            <p className="font-semibold">{email.subject}</p>
            <p className="text-muted-foreground">To {email.to}</p>
            <pre className="mt-2 whitespace-pre-wrap font-sans">{email.body}</pre>
          </li>
        ))}
      </ul>
    </>
  );
}
