// DRAFT: The owner should review this text with a lawyer before it goes live.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for ALL AUTO TT, explaining how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 2026</p>
      
      <div className="mt-8 space-y-6 text-base leading-7">
        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Who we are</h2>
          <p className="mt-2">
            ALL AUTO TT is an online marketplace operated by Simeon Doolarsingh in Trinidad and Tobago. 
            This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website (&quot;the Platform&quot;). 
            We respect your privacy and follow the principles of the Trinidad and Tobago Data Protection Act.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">What information we collect</h2>
          <p className="mt-2">
            We collect different information depending on how you use the Platform:
          </p>
          <h3 className="mt-4 text-lg font-semibold">If you are a dealer</h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Business name, contact person, email, phone, WhatsApp number</li>
            <li>Business address, region, opening hours, and registration number (optional)</li>
            <li>Password (stored encrypted)</li>
            <li>Photos you upload for your logo and part listings</li>
            <li>Bank transfer receipts you upload as proof of payment (kept private)</li>
            <li>Listing details: part descriptions, prices, stock locations</li>
            <li>Activity logs: when you log in, edit listings, or respond to inquiries</li>
          </ul>
          <h3 className="mt-4 text-lg font-semibold">If you are a buyer</h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Name, email, and phone number if you submit a part request or inquiry</li>
            <li>Your IP address and browser type (collected automatically for security and analytics)</li>
            <li>Pages you visit, parts you view, and dealers you contact (basic analytics)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">How we use your information</h2>
          <p className="mt-2">
            We use your information to:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Operate the Platform and provide the marketplace service</li>
            <li>Create and manage dealer accounts</li>
            <li>Process payments and activate dealer plans</li>
            <li>Connect buyers with dealers (by showing dealer contact details publicly)</li>
            <li>Send part requests and inquiries to dealers</li>
            <li>Improve the Platform and understand how people use it</li>
            <li>Detect and prevent fraud, abuse, and prohibited activity</li>
            <li>Respond to your questions and support requests</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Who we share your information with</h2>
          <p className="mt-2">
            We do not sell your personal information to anyone. We share information only as described below:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              <strong>Public listings:</strong> Dealer business names, phone numbers, WhatsApp numbers, addresses, regions, 
              and part photos are visible to anyone who visits the Platform. This is how buyers find and contact dealers.
            </li>
            <li>
              <strong>Service providers:</strong> We use Supabase (database hosting) and Vercel (website hosting) to store and deliver the Platform. 
              These providers have access to data only as needed to provide their services.
            </li>
            <li>
              <strong>Analytics:</strong> We use basic analytics tools to understand how people use the Platform. 
              This data is aggregated and does not identify individuals.
            </li>
            <li>
              <strong>Legal requirements:</strong> We may disclose information if required by law, court order, or government request in Trinidad and Tobago.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">How we protect your information</h2>
          <p className="mt-2">
            We take reasonable steps to protect your personal information:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Passwords are encrypted before storage</li>
            <li>Payment receipts and private business information are not shown publicly</li>
            <li>The Platform uses secure connections (HTTPS)</li>
            <li>We limit access to personal information to authorized staff only</li>
          </ul>
          <p className="mt-2">
            However, no system is completely secure. You are responsible for keeping your account password safe.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">How long we keep your information</h2>
          <p className="mt-2">
            We keep your information for as long as your account is active, or as needed to provide the Platform. 
            If you close your account, we may keep some information for legal or business purposes 
            (for example, to resolve disputes, prevent fraud, or comply with tax laws). 
            Listings and photos are typically deleted within 90 days after an account is closed, 
            unless required for legal reasons.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Your rights</h2>
          <p className="mt-2">
            Under the Trinidad and Tobago Data Protection Act, you have rights over your personal information:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li><strong>Access:</strong> You can ask us what personal information we hold about you</li>
            <li><strong>Correction:</strong> You can update your account details at any time in your dashboard</li>
            <li><strong>Deletion:</strong> You can ask us to delete your account and information, subject to legal retention requirements</li>
            <li><strong>Objection:</strong> You can object to how we use your information in certain cases</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, contact us at the details below.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Cookies and tracking</h2>
          <p className="mt-2">
            We use cookies and similar technologies to keep you logged in and to understand how the Platform is used. 
            You can disable cookies in your browser settings, but some features of the Platform may not work properly if you do.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Third-party links</h2>
          <p className="mt-2">
            The Platform may include links to third-party websites (for example, WhatsApp or dealer websites). 
            We are not responsible for the privacy practices of those sites. 
            Please read their privacy policies before sharing information with them.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Children&apos;s privacy</h2>
          <p className="mt-2">
            The Platform is not intended for anyone under 18 years old. 
            We do not knowingly collect personal information from children. 
            If you believe we have collected information from a child, please contact us and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Changes to this Privacy Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. 
            If we make material changes, we will post the new policy on this page and update the date at the top. 
            Your continued use of the Platform after changes means you accept the new policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold uppercase">Contact us</h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy, or want to exercise your rights, contact us:
          </p>
          <ul className="mt-2 ml-6 list-none space-y-1">
            <li>Email: <a href="mailto:allautott@gmail.com" className="font-semibold text-orange-ink">allautott@gmail.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/18683224691" className="font-semibold text-orange-ink">+1 868 322-4691</a></li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-zinc-50 p-4">
          <p className="text-sm">
            <strong>Note:</strong> This Privacy Policy is written in plain English to help you understand how we handle your information. 
            It reflects our good-faith interpretation of Trinidad and Tobago data protection law. 
            If you have concerns about how we handle your data, please contact us.
          </p>
        </section>
      </div>
    </main>
  );
}
