// DRAFT: The owner should review this text with a lawyer before it goes live.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for ALL AUTO TT, a used car parts marketplace in Trinidad and Tobago.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 2026</p>
      
      <div className="mt-8 space-y-6 text-base leading-7">
        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Welcome to ALL AUTO TT</h2>
          <p className="mt-2">
            ALL AUTO TT is an online marketplace operated by Simeon Doolarsingh in Trinidad and Tobago. 
            By using this website (&quot;the Platform&quot;), you agree to these Terms of Use. 
            If you do not agree, please do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">What we do</h2>
          <p className="mt-2">
            ALL AUTO TT lets independent parts dealers list used car parts for sale. 
            Buyers browse the listings, then contact dealers directly via WhatsApp or phone. 
            ALL AUTO TT does not sell parts, hold inventory, process payments, or handle delivery. 
            The sale happens between the buyer and the dealer. We provide the platform only.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Who can use the Platform</h2>
          <p className="mt-2">
            You must be at least 18 years old to create an account or use the Platform to buy or sell parts. 
            Dealers must provide accurate business information when they sign up. 
            We approve dealer accounts before they can list parts publicly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Listings and accuracy</h2>
          <p className="mt-2">
            Dealers are responsible for their own listings, including photos, prices, descriptions, and contact details. 
            ALL AUTO TT does not verify the condition, fitment, or availability of any part. 
            Dealers must mark parts as reserved or sold when they are no longer available. 
            Listings that break the rules may be removed without refund.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Buyer responsibility</h2>
          <p className="mt-2">
            Buyers must inspect parts before paying. Meet at the dealer&apos;s business address. 
            Do not pay until you see the part and agree on its condition. 
            ALL AUTO TT is not party to any sale and does not guarantee parts, prices, condition, fitment, or dealer conduct. 
            See our <Link href="/safety" className="font-semibold text-orange-ink">Safety tips</Link> page for more guidance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Dealer plans and payments</h2>
          <p className="mt-2">
            Dealers can list parts on a Free plan (up to 10 listings), or subscribe to Pro (TT$200/month) or Premium (TT$400/month). 
            A founding dealer offer gives 60 days free, then TT$150/month. 
            Featured listing boosts cost TT$50 for 7 days. 
            Dealers pay by bank transfer and upload a receipt. An admin approves the payment and activates the plan. 
            See our <Link href="/refunds" className="font-semibold text-orange-ink">Refund &amp; Cancellation Policy</Link> for details on cancellations and refunds.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Prohibited activities</h2>
          <p className="mt-2">
            You may not use the Platform to:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Post false, misleading, or fraudulent listings</li>
            <li>Sell stolen parts or parts you do not own</li>
            <li>Harass, threaten, or abuse other users</li>
            <li>Scrape, copy, or harvest data from the Platform</li>
            <li>Interfere with the Platform&apos;s operation or security</li>
            <li>Violate any law in Trinidad and Tobago</li>
          </ul>
          <p className="mt-2">
            We may suspend or ban accounts that break these rules, without notice or refund.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Disclaimers</h2>
          <p className="mt-2">
            ALL AUTO TT is provided &quot;as is&quot;, without warranties of any kind. 
            We do not guarantee that the Platform will be available, secure, or error-free at all times. 
            We do not guarantee the accuracy, quality, or legality of any listing, or the conduct of any dealer or buyer. 
            Use the Platform at your own risk.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Limitation of liability</h2>
          <p className="mt-2">
            ALL AUTO TT, its owner, and its operators are not liable for any loss, damage, or injury arising from your use of the Platform, 
            including disputes between buyers and dealers, defective parts, payment issues, or data loss. 
            Our maximum liability to you is the amount you paid us in the last 12 months, if any.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Changes to these Terms</h2>
          <p className="mt-2">
            We may update these Terms from time to time. 
            If we make material changes, we will post the new Terms on this page and update the date at the top. 
            Your continued use of the Platform after changes means you accept the new Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Governing law</h2>
          <p className="mt-2">
            These Terms are governed by the laws of Trinidad and Tobago. 
            Any dispute will be resolved in the courts of Trinidad and Tobago.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Contact us</h2>
          <p className="mt-2">
            If you have questions about these Terms, contact us:
          </p>
          <ul className="mt-2 ml-6 list-none space-y-1">
            <li>Email: <a href="mailto:allautott@gmail.com" className="font-semibold text-orange-ink">allautott@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/18683224691" className="font-semibold text-orange-ink">+1 868 322-4691</a></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
