import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { loginAction } from "@/app/actions/public";
import { Field, controlClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { demoAccounts } from "@/lib/config";
import { firstParam, safeNext } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in" };

type Query = Promise<Record<string, string | string[] | undefined>>;

export default function LoginPage({ searchParams }: { searchParams: Query }) {
  return (
    <Suspense fallback={<p className="px-4 py-10">Loading sign in…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Query }) {
  const query = await searchParams;
  const next = safeNext(firstParam(query.next) || "/dealer");
  const local = !isSupabaseConfigured();
  return (
    <main className="mx-auto grid max-w-lg gap-4 px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold uppercase">Sign in</h1>
      {firstParam(query.error) ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {firstParam(query.error)}
        </p>
      ) : null}
      <form action={loginAction} className="grid gap-4 rounded-3xl border border-border bg-white p-4">
        <input type="hidden" name="next" value={next} />
        <Field label="Email">
          <input className={controlClass} name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Password">
          <input className={controlClass} name="password" type="password" required autoComplete="current-password" />
        </Field>
        <SubmitButton size="lg" pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>
      <p className="text-sm">
        New yard? <Link href="/dealer/signup" className="font-semibold text-orange-ink">Create a dealer account</Link>
      </p>
      {local ? (
        <aside className="rounded-2xl border border-border bg-white p-4 text-sm">
          <p className="font-semibold">Local demo, no Supabase keys</p>
          <ul className="mt-2 space-y-1">
            <li>Admin: {demoAccounts.admin.email} / {demoAccounts.admin.password}</li>
            <li>Pro dealer: akeem@centralparts.example / {demoAccounts.dealer.password}</li>
            <li>Premium dealer: lisa@southside.example / {demoAccounts.dealer.password}</li>
            <li>Free dealer: ron@eastyard.example / {demoAccounts.dealer.password}</li>
            <li>Pending dealer: maya@crownpoint.example / {demoAccounts.dealer.password}</li>
          </ul>
        </aside>
      ) : null}
    </main>
  );
}
