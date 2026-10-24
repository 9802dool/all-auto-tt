import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { featuredBoost, plans } from "@/lib/config";
import { formatTTD } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "For dealers",
  description: "List used parts on ALL AUTO TT. Buyers WhatsApp you and pay on pickup. Plans from free to TT$400 a month.",
};

const faqs = [
  ["How do buyers pay me?", "They pay you when they collect the part. ALL AUTO TT does not take a cut of the sale and does not hold the money."],
  ["When do I get the verified badge?", "After the platform approves your account you can list publicly. Pro and Premium include the verified badge while the plan is active. An admin can also verify a shop directly."],
  ["How do I pay for a plan?", "Bank transfer for now. Upload the receipt in your dashboard and the admin activates the plan. Card payments through WiPay are structured in the code and not switched on yet."],
  ["What happens when a part sells?", "Mark it reserved or sold. Sold parts stay visible for 7 days, then drop off search. Listings also expire after 60 days unless you press Still available."],
  ["Can I upload a lot of stock at once?", "Yes. Download the CSV template in the dashboard, or order We upload your stock and Photo service."],
];

export default function ForDealersPage() {
  return (
    <main>
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="font-display tracking-[0.18em] text-orange uppercase">For parts dealers</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.9] font-extrabold uppercase sm:text-7xl">
            Your yard. Every buyer in Trinidad & Tobago.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-200">
            Scrapyards, foreign-used importers and parts shops list stock here. Buyers browse everyone, then WhatsApp you. You keep the sale.
          </p>
          <Link href="/dealer/signup" className={cn(buttonVariants({ variant: "accent", size: "xl" }), "mt-8 inline-flex")}>
            Create a dealer account
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
        {[
          ["Leads you can count", "Every WhatsApp click, call and inquiry is logged on the part. That is how the platform proves it is worth paying for."],
          ["Photos from your phone", "Add a listing in a couple of minutes. The form compresses camera photos before upload."],
          ["A link you can share", "Each shop gets a storefront, a QR flyer and square images sized for WhatsApp status."],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-3xl border border-border bg-white p-5">
            <h2 className="font-display text-2xl font-bold uppercase">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="font-display text-4xl font-bold uppercase">Plans</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {Object.values(plans).map((plan) => (
            <article key={plan.id} className={`rounded-3xl border p-5 ${plan.id === "pro" ? "border-orange bg-white shadow-sm" : "border-border bg-white"}`}>
              <h3 className="font-display text-3xl font-bold uppercase">{plan.name}</h3>
              <p className="mt-2 font-display text-4xl font-extrabold">{plan.price === 0 ? "TT$0" : formatTTD(plan.price)}<span className="text-base font-medium text-muted-foreground">{plan.price ? " / mo" : ""}</span></p>
              <ul className="mt-4 space-y-2 text-sm">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Featured listing boost: {formatTTD(featuredBoost.price)} for {featuredBoost.days} days on the homepage.</p>
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="font-display text-4xl font-bold uppercase">FAQ</h2>
        <div className="mt-4 space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="rounded-2xl border border-border bg-white px-4 py-3">
              <summary className="cursor-pointer font-semibold">{question}</summary>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
        <Link href="/dealer/signup" className={cn(buttonVariants({ size: "xl" }), "mt-8 inline-flex")}>
          Sign up your shop
        </Link>
      </section>
    </main>
  );
}
