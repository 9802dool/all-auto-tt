import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20">
      <p className="text-sm font-semibold tracking-wide text-orange-ink uppercase">404</p>
      <h1 className="font-display text-5xl font-extrabold uppercase">That page is not on the yard</h1>
      <p className="mt-3 text-muted-foreground">The listing may have been sold, expired, or the link is wrong.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/browse" className="inline-flex h-11 items-center rounded-xl bg-charcoal px-4 font-semibold text-white">
          Browse parts
        </Link>
        <Link href="/request" className="inline-flex h-11 items-center rounded-xl border border-border bg-white px-4 font-semibold">
          Request a part
        </Link>
      </div>
    </main>
  );
}
