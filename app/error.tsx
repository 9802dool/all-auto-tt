"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-20">
      <h1 className="font-display text-5xl font-extrabold uppercase">Something stalled</h1>
      <p className="mt-3 text-muted-foreground">The page did not finish loading. Try it again.</p>
      <button type="button" onClick={() => reset()} className="mt-6 inline-flex h-11 items-center rounded-xl bg-charcoal px-4 font-semibold text-white">
        Try again
      </button>
    </main>
  );
}
