import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ImportForm } from "@/components/import-form";
import { requireDealer } from "@/lib/auth";

export const metadata: Metadata = { title: "CSV upload" };

export default function ImportPage() {
  return (
    <Suspense fallback={<p>Loading import…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Bulk upload</h1>
      <p className="text-sm text-muted-foreground">
        Download the{" "}
        <Link href="/dealer/parts/template" className="font-semibold text-orange-ink">
          CSV template
        </Link>
        . Categories, conditions and regions must match the site lists. Rows stop when the plan listing limit is reached.
      </p>
      <ImportForm />
    </>
  );
}
