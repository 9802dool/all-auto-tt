import type { Metadata } from "next";
import { Suspense } from "react";
import { profileAction } from "@/app/actions/dealer";
import { Flash } from "@/components/flash";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { requireDealer } from "@/lib/auth";
import { regions } from "@/lib/config";
import { firstParam } from "@/lib/format";

export const metadata: Metadata = { title: "Shop profile" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function SettingsPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p>Loading profile…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  const { dealer } = await requireDealer();
  if (!dealer) return null;
  const query = await searchParams;
  return (
    <>
      <h1 className="font-display text-4xl font-extrabold uppercase">Shop profile</h1>
      <Flash ok={firstParam(query.ok)} error={firstParam(query.error)} />
      <form action={profileAction} className="grid gap-4 rounded-3xl border border-border bg-white p-4">
        <Field label="Business name">
          <input className={controlClass} name="business_name" required defaultValue={dealer.business_name} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact person">
            <input className={controlClass} name="contact_name" required defaultValue={dealer.contact_name} />
          </Field>
          <Field label="Email">
            <input className={controlClass} name="email" type="email" required defaultValue={dealer.email} />
          </Field>
          <Field label="Phone">
            <input className={controlClass} name="phone" required defaultValue={dealer.phone} />
          </Field>
          <Field label="WhatsApp">
            <input className={controlClass} name="whatsapp" required defaultValue={dealer.whatsapp} />
          </Field>
          <Field label="Region">
            <select className={controlClass} name="region" defaultValue={dealer.region}>
              {regions.map((region) => (
                <option key={region.name}>{region.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Hours">
            <input className={controlClass} name="hours" defaultValue={dealer.hours} />
          </Field>
        </div>
        <Field label="Address">
          <input className={controlClass} name="address" required defaultValue={dealer.address} />
        </Field>
        <Field label="About">
          <textarea className={`${controlClass} h-28 py-2`} name="about" defaultValue={dealer.about} />
        </Field>
        <Field label="Registration number">
          <input className={controlClass} name="registration_number" defaultValue={dealer.registration_number} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Replace logo">
            <input className={controlClass} name="logo" type="file" accept="image/*" />
          </Field>
          <Field label="Replace cover">
            <input className={controlClass} name="cover" type="file" accept="image/*" />
          </Field>
        </div>
        <SubmitButton size="lg">Save profile</SubmitButton>
      </form>
    </>
  );
}
