import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { RequestForm } from "@/components/buyer-forms";
import { getCatalog } from "@/lib/data";

export const metadata: Metadata = {
  title: "Request a part",
  description: "Tell ALL AUTO TT the vehicle and the part. Dealers who stock that make get the request.",
};

export default function RequestPage() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <div>
        <h1 className="font-display text-5xl font-extrabold uppercase">Request a part</h1>
        <p className="mt-3 text-muted-foreground">
          If it is not listed, post the vehicle and the part. The request is saved and emailed to dealers who stock that make. Pro and Premium dealers can see your phone and reply on WhatsApp.
        </p>
      </div>
      <Suspense fallback={<p className="rounded-3xl border border-border bg-white p-5">Loading the request form…</p>}>
        <RequestCatalog />
      </Suspense>
    </main>
  );
}

async function RequestCatalog() {
  await connection();
  const catalog = await getCatalog();
  return (
    <div className="rounded-3xl border border-border bg-white p-5">
      <RequestForm makes={catalog.makes.map((make) => make.name)} models={catalog.models} />
    </div>
  );
}
