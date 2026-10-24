"use client";

import { useActionState } from "react";
import { receiptAction } from "@/app/actions/dealer";
import type { FormState } from "@/app/actions/types";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

const empty: FormState = {};

export function ReceiptForm({
  payments,
  selected,
}: {
  payments: { id: string; label: string }[];
  selected?: string;
}) {
  const [state, action] = useActionState(receiptAction, empty);
  if (!payments.length) return <p className="text-sm text-muted-foreground">Start an upgrade, feature or extra first. Then upload the receipt here.</p>;
  return (
    <form action={action} className="grid gap-3">
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <Field label="Which payment is this receipt for?">
        <select className={controlClass} name="payment_id" defaultValue={selected || payments[0]?.id}>
          {payments.map((payment) => (
            <option key={payment.id} value={payment.id}>
              {payment.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Receipt" hint="Photo or PDF, up to 8MB.">
        <input className={controlClass} name="receipt" type="file" accept="image/*,application/pdf" required />
      </Field>
      <SubmitButton pendingLabel="Uploading…">Upload receipt</SubmitButton>
    </form>
  );
}
