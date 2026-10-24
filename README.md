# ALL AUTO TT

Used auto parts marketplace for Trinidad and Tobago. Dealers list engines, gearboxes and body parts. Buyers search every yard, then WhatsApp or call the dealer and pay on pickup. The platform charges dealers for plans, featured listings and ads. It does not sell parts.

Working name, tagline and prices live in `lib/config.ts`. Domain placeholder: allautott.com.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

With Supabase variables left empty, the first page load writes `data/db.json` (gitignored) with 4 sample dealers and 24 sample parts. Photos in `public/parts` and `public/dealers` are sample imagery. Uploaded photos go to `public/uploads`.

### Demo logins

Shown on the sign-in page while Supabase is unset.

| Who | Email | Password |
| --- | --- | --- |
| Platform admin | admin@allautott.com | demo-admin |
| Pro dealer, Chaguanas | akeem@centralparts.example | demo-dealer |
| Premium dealer, San Fernando | lisa@southside.example | demo-dealer |
| Free dealer, Arima | ron@eastyard.example | demo-dealer |
| Pending dealer, Tobago | maya@crownpoint.example | demo-dealer |

## What to click

- Home search, then Browse with filters in the URL.
- A part page: WhatsApp opens `wa.me` with the listing title and link. Call and the inquiry form are the other paths. Pay-on-pickup is stated on the page.
- `/request` posts a part request. Paid dealers who stock that make see the phone number. Free dealers see a blurred preview.
- `/for-dealers` is the page to send to yards: benefits, TT$ prices, FAQ, sign-up.
- Dealer dashboard: add a part (camera photos are compressed), CSV at `/dealer/parts/import`, mark reserved or sold, Still available?, feature for TT$50, upload a bank receipt.
- Admin: approve Crown Point, mark East Yard's pending transfer paid, moderate a report, schedule an ad or Dealer of the Month, copy the daily digest.
- Share kit: square and story images, storefront QR, PDF flyer, and `/api/flyers/mechanics`.
- `/new`, `/feed.xml`, `/feed.json`, `/toyota/gearboxes`, `/sitemap.xml`.

The bank account in the billing screen is a placeholder.

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL. Leave empty for the local demo. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and cookie auth key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Never expose it to the browser. |
| `NEXT_PUBLIC_SITE_URL` | Links in WhatsApp messages, feeds and the sitemap. |
| `SESSION_SECRET` | Signs the local session cookie. Required in production. |
| `NEXT_PUBLIC_GA_ID` | GA4 id, `G-…`. Omitted script if empty. |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook pixel id. Omitted if empty. |
| `RESEND_API_KEY` | Sends the outbox. Without it, mail is marked logged. |
| `EMAIL_FROM` | From address for Resend. |
| `CRON_SECRET` | Bearer token for `GET /api/cron/maintenance`. |
| `ADMIN_EMAIL` | Receives new-dealer notices. |

All three Supabase variables must be set together. The app then uses Auth, Postgres and the `media` storage bucket. The service role bypasses row-level security; the app still checks that a dealer only edits their own shop. SQL policies are the backstop for direct client access.

## Supabase

1. Create a project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. Run `supabase/seed.sql` for categories, makes and models.
4. In Authentication, turn off email confirmation if you want sign-up to land straight in the dashboard.
5. Put the URL, anon key and service role key in `.env.local`.
6. Promote a profile to admin after that person signs up:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Dealers can update their own row and listings. Triggers stop them changing plan, verification, featured flags and lead counters. Admins can edit every table. Storage bucket `media` is public-read.

The local JSON file is the demo. Production on Vercel should use Supabase. Without Supabase, Vercel keeps demo data in `/tmp`, which resets whenever a function instance is recycled.

## Vercel

Live: https://all-auto-tt.vercel.app (Vercel project `all-auto-tt`, GitHub `9802dool/all-auto-tt`). Pushes to `main` deploy to production.

1. The GitHub repository is already imported.
2. Set the environment variables above. `NEXT_PUBLIC_SITE_URL` should be the production origin, for example `https://allautott.com`.
3. Set `SESSION_SECRET` and `CRON_SECRET` to long random strings.
4. Deploy. `vercel.json` calls `/api/cron/maintenance` at 12:00 UTC (8:00am Trinidad) to queue expiry and renewal emails, then send them when `CRON_SECRET` and Resend are set.
5. Vercel Analytics is included. GA4 and the Facebook pixel render only when their ids are set.

## Plans

Configured in `lib/config.ts`, prices in TTD.

- Free: 10 live listings.
- Pro: TT$200/mo, 150 listings, verified badge, stats, full request details.
- Premium: TT$400/mo, unlimited listings, search priority, homepage spotlight eligibility.
- Featured listing: TT$50 for 7 days.

v1 payments are manual bank transfer. The dealer uploads a receipt and the admin marks it paid. `lib/payments.ts` exports `createWipayCheckout`, which returns `enabled: false` until WiPay is connected. Billing screens do not need to change when that function starts returning a checkout URL.

## Not built yet

These files hold the seam and do not call a provider:

- `lib/payments.ts` — WiPay card payments.
- `lib/later.ts` — SMS or WhatsApp lead alerts, and delivery quotes.

A mobile app is out of scope. The site is mobile-first.

## Freshness and leads

Listings expire after 60 days unless the dealer presses Still available. Sold parts leave public search 7 days after they are marked sold. Every WhatsApp click, call click and form inquiry is stored per part and shown in the dealer dashboard.

## Scripts

```bash
npm run dev        # http://127.0.0.1:43123
npm run typecheck
npm run lint
npm run build
```
