// DRAFT: The owner should review this text with a lawyer before it goes live.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refund and cancellation policy for ALL AUTO TT dealer plans and featured listing boosts.",
};

export default function RefundsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Refund &amp; Cancellation Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 2026</p>
      
      <div className="mt-8 space-y-6 text-base leading-7">
        <section>
          <h2 className="font-display text-2xl font-bold uppercase">What this policy covers</h2>
          <p className="mt-2">
            This policy applies to dealer subscription plans (Free, Pro, Premium, and founding dealer offers) 
            and featured listing boosts purchased on ALL AUTO TT. 
            It does not apply to sales between buyers and dealers, which ALL AUTO TT is not party to.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">General refund policy</h2>
          <p className="mt-2">
            Dealer plan fees and featured listing boosts are <strong>generally non-refundable</strong> once activated. 
            When you pay for a plan or boost and we approve it, the service starts immediately. 
            Because you can use the service right away (list parts, gain visibility, receive leads), 
            we do not offer refunds for change of mind or if you decide not to use the plan.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">When refunds are available</h2>
          <p className="mt-2">
            We will consider a refund in the following cases:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              <strong>Payment error:</strong> You paid by mistake (for example, you paid twice, or the wrong amount), 
              and you request a refund within 7 days of payment.
            </li>
            <li>
              <strong>Service not provided:</strong> We could not activate your plan or boost due to a technical problem on our end, 
              and we could not resolve it within a reasonable time.
            </li>
            <li>
              <strong>Account suspension before service starts:</strong> Your account was suspended for a reason outside your control 
              before your paid plan was activated.
            </li>
          </ul>
          <p className="mt-2">
            To request a refund, contact us within 7 days of the payment via WhatsApp or email (see contact details below). 
            Provide your dealer account name, the payment date, and the reason for the request. 
            We will review your request and respond within 5 business days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Cancelling your plan</h2>
          <p className="mt-2">
            You can cancel your dealer subscription at any time by contacting us. 
            When you cancel:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Your plan will continue until the end of the period you have already paid for (for example, if you cancel on day 10 of a monthly plan, the plan runs until day 30)</li>
            <li>After the paid period ends, your account will revert to the Free plan</li>
            <li>We do not refund unused days in the current billing period</li>
            <li>You can resubscribe at any time by making a new payment</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">If we suspend your account</h2>
          <p className="mt-2">
            If your account or listings are suspended because you broke the Platform&apos;s rules 
            (for example, posting false listings, harassment, or other prohibited activity), 
            you are <strong>not entitled to a refund</strong> for any plan fees or boosts you have paid. 
            This is stated in our Terms of Use.
          </p>
          <p className="mt-2">
            If we suspend your account in error, and you can show that you did not break the rules, 
            we will restore your account or refund the unused portion of your plan, at our discretion.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Prorated refunds</h2>
          <p className="mt-2">
            We do not offer prorated refunds if you cancel partway through a billing period. 
            The exception is if we suspend your account in error (see above), 
            or if we discontinue a paid plan or feature and cannot provide a reasonable alternative.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">How refunds are processed</h2>
          <p className="mt-2">
            If we approve a refund, we will return the payment by bank transfer to the account you paid from. 
            Refunds are processed within 10 business days of approval. 
            We will notify you by email when the refund is sent.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Founding dealer offer</h2>
          <p className="mt-2">
            The founding dealer offer (60 days free, then TT$150/month) is a promotional plan. 
            The free period is non-refundable (because there is no charge). 
            After the free period ends, the TT$150/month subscription follows the same refund and cancellation terms as other plans.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Featured listing boosts</h2>
          <p className="mt-2">
            Featured listing boosts (TT$50 for 7 days on the homepage) are non-refundable once activated. 
            The boost starts as soon as we approve your payment and place the listing on the homepage. 
            If your listing is removed from the homepage for a reason outside your control 
            (for example, a technical error on our end), we will extend the boost or refund the fee, at our discretion.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Disputes</h2>
          <p className="mt-2">
            If you disagree with our decision on a refund request, you can ask us to review it again. 
            Contact us with any additional information that supports your case. 
            Our decision after the second review is final.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Changes to this policy</h2>
          <p className="mt-2">
            We may update this Refund &amp; Cancellation Policy from time to time. 
            Changes will be posted on this page with a new &quot;Last updated&quot; date. 
            The policy that was in effect at the time of your payment applies to that payment.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Contact us</h2>
          <p className="mt-2">
            To cancel your plan or request a refund, contact us:
          </p>
          <ul className="mt-2 ml-6 list-none space-y-1">
            <li>Email: <a href="mailto:allautott@gmail.com" className="font-semibold text-orange-ink">allautott@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/18683224691" className="font-semibold text-orange-ink">+1 868 322-4691</a></li>
          </ul>
          <p className="mt-2">
            Include your dealer account name, payment date, and the reason for your request.
          </p>
        </section>
      </div>
    </main>
  );
}
