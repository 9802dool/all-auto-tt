import { Suspense } from "react";
import Link from "next/link";
import { requireDealer } from "@/lib/auth";
import { PortalShell } from "@/components/portal-shell";
import { buttonVariants } from "@/components/ui/button";
import { dealerNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="px-4 py-10">Opening your yard…</p>}>
      <DealerGate>{children}</DealerGate>
    </Suspense>
  );
}

async function DealerGate({ children }: { children: React.ReactNode }) {
  const { dealer } = await requireDealer();
  if (!dealer) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-4xl font-extrabold uppercase">Platform admin</h1>
        <p className="mt-3 text-muted-foreground">This login runs the marketplace. Listing tools belong to a dealer account.</p>
        <Link href="/admin" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}>
          Open admin
        </Link>
      </main>
    );
  }
  return (
    <PortalShell title={dealer.business_name} eyebrow="Dealer" items={dealerNav}>
      {dealer.status === "pending" ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          Pending approval. Draft listings stay private until ALL AUTO TT approves the shop. Approval adds the verified badge when we mark you verified.
        </p>
      ) : null}
      {dealer.status === "suspended" ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          This account is suspended. Listings stay hidden and edits are blocked.
        </p>
      ) : null}
      {children}
    </PortalShell>
  );
}
