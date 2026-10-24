import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireDealer } from "@/lib/auth";
import { dealerDashboard } from "@/lib/data";
import { formatDateTime, waLink } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Part requests" };

export default function RequestsPage() {
  return (
    <Suspense fallback={<p>Loading requests…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const dash = await dealerDashboard(dealer.id);
  const stocked = new Set(dash.parts.map((part) => part.make));
  const matching = dash.requests.filter((request) => stocked.has(request.make));
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Part requests</h1>
      <p className="text-sm text-muted-foreground">
        Buyers post these for free. You see requests for makes you already list.
        {dash.canSeeRequests
          ? " Pro and Premium show the phone number so you can reply on WhatsApp."
          : " Free shows a blurred preview. Upgrade to reply."}
      </p>
      {stocked.size === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white p-6 text-sm">Add a listing first so we know which makes to match.</p>
      ) : matching.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white p-6 text-sm">No open requests for {Array.from(stocked).join(", ")} right now.</p>
      ) : (
        <ul className="grid gap-3">
          {matching.map((request) => (
            <li key={request.id} className="rounded-2xl border border-border bg-white p-4">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{formatDateTime(request.created_at)}</p>
              <h2 className="mt-1 font-display text-2xl font-bold uppercase">
                {request.year} {request.make} {request.model}
              </h2>
              <p>{request.part}</p>
              {request.notes ? <p className="mt-1 text-sm text-muted-foreground">{request.notes}</p> : null}
              {dash.canSeeRequests ? (
                <div className="mt-3">
                  <p className="text-sm font-semibold">
                    {request.name} · {request.phone}
                  </p>
                  <a
                    className="mt-2 inline-flex h-11 items-center rounded-xl bg-whatsapp px-4 text-sm font-semibold text-white"
                    href={waLink(request.phone, `Hi ${request.name}, ${dealer.business_name} on ALL AUTO TT may have the ${request.part} for your ${request.make} ${request.model}.`)}
                  >
                    Reply on WhatsApp
                  </a>
                </div>
              ) : (
                <div className="relative mt-3 overflow-hidden rounded-xl bg-muted p-4">
                  <p className="blur-sm select-none" aria-hidden>
                    {request.name} · {request.phone}
                  </p>
                  <div className="mt-3">
                    <p className="text-sm font-semibold">Upgrade to see the number.</p>
                    <Link href="/dealer/billing" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-2 inline-flex")}>
                      Upgrade to Pro
                    </Link>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
