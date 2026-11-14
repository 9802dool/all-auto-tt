# ALL AUTO TT

Used auto parts marketplace for Trinidad and Tobago. Dealers list engines, gearboxes and body parts. Buyers search every yard, then WhatsApp or call the dealer and pay on pickup. The platform charges dealers for plans, featured listings and ads. It does not sell parts.

Working name, tagline and prices live in `lib/config.ts`. Domain placeholder: allautott.com.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

With Supabase variables left empty, the first page load writes `data/db.json` (gitignored) with 4 sample dealers and 44 sample parts. Photos in `public/parts` and `public/dealers` are sample imagery. Uploaded photos in the local demo stay in the browser session until Supabase is configured.

### Demo logins

Shown on the sign-in page while Supabase is unset.

| Who | Email | Password |
| --- | --- | --- |
| Pro dealer, Chaguanas | akeem@centralparts.example | demo-dealer |
| Premium dealer, San Fernando | lisa@southside.example | demo-dealer |
| Free dealer, Arima | ron@eastyard.example | demo-dealer |
| Pending dealer, Tobago | maya@crownpoint.example | demo-dealer |
| Admin (site owner) | admin@allautott.example | demo-dealer |

## What to click

- Home search, then Browse with filters in the URL.
- A part page: WhatsApp opens `wa.me` with the listing title and link. Call and the inquiry form are the other paths. Pay-on-pickup is stated on the page.
- `/request` posts a part request. Paid dealers who stock that make see the phone number. Free dealers see a blurred preview.
- `/for-dealers` is the page to send to yards: benefits, TT$ prices, FAQ, sign-up.
- Dealer dashboard: add a part (camera photos are compressed), CSV at `/dealer/parts/import`, mark reserved or sold, Still available?, feature for TT$50, upload a bank receipt.
- Admin: sign in as the admin, approve Crown Point, mark East Yard's pending transfer paid, remove a bad listing, schedule an ad or Dealer of the Month, copy the daily digest.
- Share kit: square and story images, storefront QR, PDF flyer, and `/api/flyers/mechanics`.
- `/new`, `/feed.xml`, `/feed.json`, `/toyota/gearboxes`, `/sitemap.xml`.

## Set this up on Vercel

Dealer sign-up, photos, and listings only stick when these three are set together and the Supabase address is a real project. The address currently saved in Vercel, `qgictgitmszdccuvflup.supabase.co`, does not exist, so production cannot save dealers. Create a new Supabase project, run `supabase/schema.sql`, and replace the three values below. Until then the site shows the sample yards instead of going blank.

| Variable | Where to find it | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Yes, for real accounts |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page. Use the publishable key or the legacy anon key. | Yes, for real accounts |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page. Secret key or legacy service_role key. Server only. Never put this in the browser or in git. | Yes, for real accounts |
| `NEXT_PUBLIC_SITE_URL` | The public address, for example `https://all-auto-tt-bice.vercel.app` | Yes |
| `SESSION_SECRET` | Any long random string. Used when Supabase is not configured. | Yes in production |
| `ADMIN_EMAIL` | The email you sign up with. That account becomes the admin. Defaults to `allautott@gmail.com` if this is empty. | Recommended |
| `CRON_SECRET` | Long random string. Protects the daily maintenance job. | Recommended |
| `RESEND_API_KEY` | Optional. Without it, emails stay in the admin outbox. | No |
| `EMAIL_FROM` | From address for Resend. | No |
| `NEXT_PUBLIC_GA_ID` | GA4 id, `G-…`. The script is left out when this is empty. | No |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook pixel. Left out when empty. | No |

Leave all three Supabase values empty to use the local sample yard on your computer.

### First-time Supabase setup

1. Create a Supabase project.
2. Open the SQL editor, paste `supabase/schema.sql`, and run it. That creates the tables, the photo bucket named `media`, and the rules that keep dealers out of each other's stock.
3. In Authentication → Providers → Email, you can leave email confirmation on. Sign-up still creates the shop. The person confirms, then signs in.
4. Add the three Supabase values, `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`, and `ADMIN_EMAIL` in Vercel. Redeploy.
5. Open the site once. If there are no real dealers yet, the app saves the sample yards (marked Sample) so search is not empty.
6. Sign up at `/dealer/signup` with `ADMIN_EMAIL` (or `allautott@gmail.com` if you did not set it). That account can open `/admin`.
7. Approve or reject shops at `/admin/dealers`. Remove a bad part at `/admin/listings`.

If that email already has an account, open the site after deploy. The app promotes it to admin. You can also run this in the SQL editor:

```sql
select public.grant_admin('you@example.com');
```

Sample dealer logins such as `akeem@centralparts.example` work only on the local demo. They are not real Supabase users. Buyers keep seeing the sample parts, marked Sample, after a real dealer joins. Delete one from Admin → Parts if you do not want it on the site. Once a real dealer exists, the app does not add more samples.

Dealers can update their own shop and listings. They cannot change their own approval, plan, or featured flags. Photos go in the public `media` bucket. The site does not take payment for parts.

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
