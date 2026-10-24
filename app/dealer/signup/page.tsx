import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/signup-form";
import { regions } from "@/lib/config";

export const metadata: Metadata = { title: "Dealer sign up" };

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-semibold tracking-wide text-orange-ink uppercase">For dealers</p>
      <h1 className="font-display text-5xl font-extrabold uppercase">List your yard</h1>
      <p className="mt-2 text-muted-foreground">
        Scrapyards, foreign-used importers and parts shops. Buyers contact you on WhatsApp. You get paid on pickup. Already registered?{" "}
        <Link href="/login?next=/dealer" className="font-semibold text-orange-ink">
          Sign in
        </Link>
        .
      </p>
      <div className="mt-6">
        <SignupForm regions={regions.map((region) => region.name)} />
      </div>
    </main>
  );
}
