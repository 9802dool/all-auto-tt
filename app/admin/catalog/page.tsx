import type { Metadata } from "next";
import { Suspense } from "react";
import {
  categoryAction,
  deleteCategoryAction,
  deleteMakeAction,
  deleteModelAction,
  makeAction,
  modelAction,
} from "@/app/actions/admin";
import { Flash } from "@/components/flash";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { listEverything } from "@/lib/data";
import { firstParam } from "@/lib/format";

export const metadata: Metadata = { title: "Catalog" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function CatalogPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading catalog…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  await requireAdmin();
  const [data, query] = await Promise.all([listEverything(), searchParams]);
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Categories, makes, models</h1>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">Add a category</h2>
        <form action={categoryAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Name"><input className={controlClass} name="name" required /></Field>
          <Field label="SEO name"><input className={controlClass} name="seo_name" /></Field>
          <Field label="Slug"><input className={controlClass} name="slug" /></Field>
          <Field label="Icon" hint="Lucide name, such as Cog or Package."><input className={controlClass} name="icon" defaultValue="Package" /></Field>
          <SubmitButton>Add category</SubmitButton>
        </form>
        <ul className="mt-4 grid gap-2">
          {data.db.categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{category.name} · /{category.slug}</span>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <SubmitButton size="sm" variant="outline">Remove</SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">Add a make</h2>
        <form action={makeAction} className="mt-3 flex flex-wrap gap-2">
          <input className={`${controlClass} max-w-xs`} name="name" required placeholder="Make" />
          <SubmitButton>Add make</SubmitButton>
        </form>
        <ul className="mt-4 grid gap-2">
          {data.db.makes.map((make) => (
            <li key={make.id} className="text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{make.name}</span>
                <form action={deleteMakeAction}>
                  <input type="hidden" name="id" value={make.id} />
                  <SubmitButton size="sm" variant="outline">Remove make</SubmitButton>
                </form>
              </div>
              <p className="text-muted-foreground">{data.db.models.filter((model) => model.make === make.name).map((model) => model.name).join(", ")}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-border bg-white p-4">
        <h2 className="font-display text-2xl font-bold uppercase">Add a model</h2>
        <form action={modelAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Make">
            <select className={controlClass} name="make">
              {data.db.makes.map((make) => (
                <option key={make.id}>{make.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Model"><input className={controlClass} name="name" required /></Field>
          <SubmitButton>Add model</SubmitButton>
        </form>
        <ul className="mt-4 grid max-h-64 gap-1 overflow-auto text-sm">
          {data.db.models.map((model) => (
            <li key={model.id} className="flex items-center justify-between gap-2">
              <span>{model.make} {model.name}</span>
              <form action={deleteModelAction}>
                <input type="hidden" name="id" value={model.id} />
                <SubmitButton size="sm" variant="ghost">Remove</SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
