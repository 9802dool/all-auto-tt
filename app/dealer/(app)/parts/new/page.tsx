import type { Metadata } from "next";
import { Suspense } from "react";
import { PartForm } from "@/components/part-form";
import { requireDealer } from "@/lib/auth";
import { categories, conditions, regions, transmissions } from "@/lib/config";
import { getCatalog } from "@/lib/data";
import { years } from "@/lib/format";

export const metadata: Metadata = { title: "Add a part" };

export default function NewPartPage() {
  return (
    <Suspense fallback={<p>Loading the form…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const catalog = await getCatalog();
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Add a part</h1>
      <div className="rounded-3xl border border-border bg-white p-4">
        <PartForm
          catalog={{
            categories: catalog.categories.length ? catalog.categories : categories.map((item) => ({ name: item.name })),
            makes: catalog.makes,
            models: catalog.models,
          }}
          regions={regions.map((region) => region.name)}
          conditions={conditions}
          transmissions={transmissions}
          years={years()}
          location={dealer.region}
        />
      </div>
    </>
  );
}
