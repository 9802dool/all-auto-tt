import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer safety",
  description:
    "How to inspect used parts, pay dealers safely on pickup, and report misleading listings on ALL AUTO TT in Trinidad and Tobago.",
};

export default function SafetyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Inspect before you pay</h1>
      <ul className="mt-6 space-y-4 text-base leading-7">
        <li>Meet at the dealer&apos;s business address on their storefront. Do not agree to a roadside handover you did not choose.</li>
        <li>Look at the part, and hear an engine run if the dealer offers that, before any money moves.</li>
        <li>Pay the dealer directly. ALL AUTO TT does not process the sale, hold a deposit, or offer delivery in this version.</li>
        <li>If a listing looks sold, fake or priced wrong, use Report listing. Sold parts leave search after 7 days. Listings expire after 60 days unless the dealer renews them.</li>
        <li>Reviews are one per phone number, on the dealer, not on each part.</li>
      </ul>
      <p className="mt-6 text-sm">
        Workshops can print the <a className="font-semibold text-orange-ink" href={"/api/flyers/mechanics"}>Find parts fast flyer</a>.
      </p>
    </main>
  );
}
