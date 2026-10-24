import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { formatTTD } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

export default function AdminHome() {
  return (
    <Suspense fallback={<p>Loading stats…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  await requireAdmin();
  const data = await listEverything();
  const stats = [
    ["Dealers", data.stats.dealers, "/admin/dealers"],
    ["Pending", data.stats.pendingDealers, "/admin/dealers"],
    ["Listings", data.stats.listings, "/admin/listings"],
    ["Available", data.stats.available, "/admin/listings"],
    ["WhatsApp leads", data.stats.whatsappLeads, "/admin"],
    ["All leads", data.stats.leads, "/admin"],
    ["Inquiries", data.stats.inquiries, "/admin/requests"],
    ["Open reports", data.stats.openReports, "/admin/reports"],
    ["Revenue", formatTTD(data.stats.revenue), "/admin/payments"],
  ] as const;
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Marketplace stats</h1>
      <p className="text-sm text-muted-foreground">You do not sell parts. These numbers are dealers, listings, leads and subscription revenue.</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-border bg-white p-4 hover:border-orange">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
            <p className="font-display text-3xl font-extrabold">{value}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
