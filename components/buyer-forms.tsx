"use client";

import { useActionState, useState } from "react";
import { inquiryAction, reportAction, requestAction, reviewAction } from "@/app/actions/public";
import { SubmitButton } from "@/components/submit-button";
import { controlClass, Field } from "@/components/field";
import { otherMakeValue, reportReasons } from "@/lib/config";
import { notice } from "@/lib/messages";
import { resolveMakeChoice } from "@/lib/search";
import type { FormState } from "@/app/actions/types";

function Banner({ state }: { state: FormState }) {
  if (state.ok) return <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice(state.ok)}</p>;
  if (state.error) return <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>;
  return null;
}

export function InquiryForm({ partId }: { partId: string }) {
  const [state, action] = useActionState(inquiryAction, {});
  return (
    <form action={action} className="grid gap-3">
      <Banner state={state} />
      <input type="hidden" name="part_id" value={partId} />
      <Field label="Your name"><input className={controlClass} name="name" required autoComplete="name" /></Field>
      <Field label="Phone"><input className={controlClass} name="phone" required inputMode="tel" autoComplete="tel" placeholder="868-000-0000" /></Field>
      <Field label="Message"><textarea className={`${controlClass} h-28 py-2`} name="message" required placeholder="Ask if it is still on the shelf." /></Field>
      <SubmitButton size="lg" pendingLabel="Sending…">Send inquiry</SubmitButton>
    </form>
  );
}

export function ReviewForm({ dealerId }: { dealerId: string }) {
  const [state, action] = useActionState(reviewAction, {});
  return (
    <form action={action} className="grid gap-3">
      <Banner state={state} />
      <input type="hidden" name="dealer_id" value={dealerId} />
      <Field label="Name"><input className={controlClass} name="name" required /></Field>
      <Field label="Phone" hint="One review per phone number."><input className={controlClass} name="phone" required inputMode="tel" /></Field>
      <Field label="Rating">
        <select className={controlClass} name="rating" defaultValue="5">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>
          ))}
        </select>
      </Field>
      <Field label="Comment"><textarea className={`${controlClass} h-24 py-2`} name="comment" /></Field>
      <SubmitButton pendingLabel="Saving…">Save review</SubmitButton>
    </form>
  );
}

export function ReportButton({ partId }: { partId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(reportAction, {});
  return (
    <div>
      <button type="button" className="text-sm font-semibold underline" onClick={() => setOpen((value) => !value)}>
        Report listing
      </button>
      {open ? (
        <form action={action} className="mt-3 grid gap-3 rounded-2xl border border-border bg-white p-4">
          <Banner state={state} />
          <input type="hidden" name="part_id" value={partId} />
          <Field label="Reason">
            <select className={controlClass} name="reason" defaultValue={reportReasons[0]}>
              {reportReasons.map((reason) => (
                <option key={reason}>{reason}</option>
              ))}
            </select>
          </Field>
          <Field label="Details"><textarea className={`${controlClass} h-20 py-2`} name="details" /></Field>
          <SubmitButton variant="outline" pendingLabel="Sending…">Submit report</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}

export function RequestForm({
  makes,
  models,
  initial,
}: {
  makes: string[];
  models: { make: string; name: string }[];
  initial?: { make?: string; model?: string; year?: string; part?: string; notes?: string };
}) {
  const [state, action] = useActionState(requestAction, {});
  const starting = resolveMakeChoice(initial?.make, makes, makes[0] ?? otherMakeValue);
  const [makeChoice, setMakeChoice] = useState(starting.choice);
  const [customMake, setCustomMake] = useState(starting.custom);
  const isOther = makeChoice === otherMakeValue;
  if (state.ok) {
    return <p role="status" className="rounded-2xl bg-emerald-50 p-4 text-emerald-950">{notice(state.ok)}</p>;
  }
  return (
    <form action={action} className="grid gap-3">
      <Banner state={state} />
      <Field label="Your name"><input className={controlClass} name="name" required /></Field>
      <Field label="Phone"><input className={controlClass} name="phone" required inputMode="tel" /></Field>
      <Field label="Make">
        <select
          className={controlClass}
          name={isOther ? undefined : "make"}
          value={makeChoice}
          onChange={(event) => setMakeChoice(event.target.value)}
        >
          {makes.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
          <option value={otherMakeValue}>Other make</option>
        </select>
      </Field>
      {isOther ? (
        <Field label="Type the make" hint="For BMW, Mercedes, and any make that is not in the list.">
          <input
            className={controlClass}
            name="make"
            required
            minLength={2}
            maxLength={40}
            value={customMake}
            onChange={(event) => setCustomMake(event.target.value)}
            placeholder="BMW"
            autoComplete="off"
          />
        </Field>
      ) : null}
      <Field label="Model">
        {isOther ? (
          <input className={controlClass} name="model" defaultValue={initial?.model ?? ""} placeholder="Any / not sure" />
        ) : (
          <select className={controlClass} name="model" defaultValue={initial?.model ?? ""}>
            <option value="">Any / not sure</option>
            {models.filter((item) => item.make === makeChoice).map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Year"><input className={controlClass} name="year" inputMode="numeric" placeholder="2014" defaultValue={initial?.year ?? ""} /></Field>
      <Field label="Part you need"><input className={controlClass} name="part" required placeholder="Air-condition compressor" defaultValue={initial?.part ?? ""} /></Field>
      <Field label="Notes"><textarea className={`${controlClass} h-24 py-2`} name="notes" defaultValue={initial?.notes ?? ""} /></Field>
      <SubmitButton size="lg" variant="accent" pendingLabel="Posting…">Post request</SubmitButton>
      <p className="text-xs text-muted-foreground">Requests are free. Your phone is shown to Pro and Premium dealers who stock this make.</p>
    </form>
  );
}
