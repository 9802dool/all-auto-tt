import type { Metadata } from "next";
import Link from "next/link";
import { PartCard } from "@/components/part-card";
import { cachedArrivals } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "New arrivals",
  description: "The latest used parts listed by dealers across Trinidad and Tobago.",
};

export default async function NewArrivalsPage() {
  const parts = await cachedArrivals();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">New arrivals</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Same list as the feeds: <Link className="font-semibold text-orange-ink" href="/feed.xml">RSS</Link> and <Link className="font-semibold text-orange-ink" href="/feed.json">JSON</Link>.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {parts.map((part) => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </main>
  );
}
