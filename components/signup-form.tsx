"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/public";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/app/actions/types";

const empty: FormState = {};

export function SignupForm({ regions }: { regions: readonly string[] }) {
  const [state, action] = useActionState(signupAction, empty);
  return (
    <form action={action} className="grid gap-4 rounded-3xl border border-border bg-white p-4 sm:p-6">
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <Field label="Business name">
        <input className={controlClass} name="business_name" required minLength={2} autoComplete="organization" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact person">
          <input className={controlClass} name="contact_name" required autoComplete="name" />
        </Field>
        <Field label="Email">
          <input className={controlClass} name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Phone" hint="868 number. We store it as 1868…">
          <input className={controlClass} name="phone" required inputMode="tel" autoComplete="tel" placeholder="868-555-0101" />
        </Field>
        <Field label="WhatsApp" hint="Leave blank to use the phone number.">
          <input className={controlClass} name="whatsapp" inputMode="tel" autoComplete="tel" />
        </Field>
      </div>
      <Field label="Password" hint="At least 8 characters.">
        <input className={controlClass} name="password" type="password" required minLength={8} autoComplete="new-password" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Region">
          <select className={controlClass} name="region" required defaultValue="">
            <option value="" disabled>
              Choose a region
            </option>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </Field>
        <Field label="Opening hours">
          <input className={controlClass} name="hours" placeholder="Mon–Sat 8:00am–4:00pm" />
        </Field>
      </div>
      <Field label="Business address">
        <input className={controlClass} name="address" required minLength={4} autoComplete="street-address" />
      </Field>
      <Field label="About the yard" hint="Optional. Buyers see this on the storefront.">
        <textarea className={`${controlClass} h-28 py-2`} name="about" />
      </Field>
      <Field label="Business registration number" hint="Optional.">
        <input className={controlClass} name="registration_number" />
      </Field>
      <Field label="Logo" hint="Optional. Photos are resized before they are stored.">
        <input className={controlClass} name="logo" type="file" accept="image/*" />
      </Field>
      <SubmitButton size="lg" pendingLabel="Creating the shop…">
        Create dealer account
      </SubmitButton>
      <p className="text-sm text-muted-foreground">
        The account stays pending until ALL AUTO TT approves it. You can draft listings in the meantime. Buyers will not see them yet.
      </p>
    </form>
  );
}
