"use client";

import { useActionState } from "react";
import { importAction } from "@/app/actions/dealer";
import type { FormState } from "@/app/actions/types";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

const empty: FormState = {};

export function ImportForm() {
  const [state, action] = useActionState(importAction, empty);
  return (
    <form action={action} className="grid gap-3 rounded-3xl border border-border bg-white p-4">
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <Field label="CSV file" hint="Photos are not in the CSV. Add them after import, or use a sample photo the importer assigns.">
        <input className={controlClass} name="file" type="file" accept=".csv,text/csv" required />
      </Field>
      <p className="text-sm text-muted-foreground">Each row gets a stand-in yard photo. Open the listing afterwards and replace it with the real part.</p>
      <SubmitButton pendingLabel="Importing…">Upload listings</SubmitButton>
    </form>
  );
}
