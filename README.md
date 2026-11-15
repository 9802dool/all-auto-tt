# ALL AUTO TT

Used auto parts marketplace for Trinidad and Tobago. Dealers list engines, gearboxes and body parts. Buyers search every yard, then WhatsApp or call the dealer and pay on pickup. The platform charges dealers for plans, featured listings and ads. It does not sell parts.

Working name, tagline and prices live in `lib/config.ts`. Domain placeholder: allautott.com.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

The first page load writes `data/db.json` (gitignored) with 4 sample dealers and 45 sample parts. Photos in `public/parts` and `public/dealers` are sample pictures. On your computer, new photos are saved in `public/uploads`.

### Demo logins

Shown on the sign-in page when you run the site on your computer. These same logins work on the live site after the file store is connected, because the sample yards are copied there.

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

The site does not use Supabase. Shops, parts, and photos are saved in **Vercel Blob**, which is free on the Hobby plan (about 1 GB of files). You do not pay extra. If that free amount is used up, Blob pauses until the next month. It does not charge you.

The sample yards are built into the site, so the homepage still shows parts even before Blob is connected. Saving a new shop or a new photo needs Blob.

You can remove these old values if they are still in the project. They are not used:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

| Variable | What it is | Required |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Added for you when you create the Blob store below. Do not type this by hand. | Yes, to save shops and photos |
| `NEXT_PUBLIC_SITE_URL` | The public address, for example `https://all-auto-tt-bice.vercel.app` | Yes |
| `SESSION_SECRET` | A long random password the site uses to keep people signed in. | Yes |
| `ADMIN_EMAIL` | The email you sign up with. That person can open the admin page. If empty, it is `allautott@gmail.com`. | Recommended |
| `CRON_SECRET` | A long random password for the daily cleanup job. | Recommended |
| `RESEND_API_KEY` | Optional. Without it, emails stay in the admin outbox. | No |
| `EMAIL_FROM` | From address for those emails. | No |
| `NEXT_PUBLIC_GA_ID` | Google Analytics id. Left out when empty. | No |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook pixel. Left out when empty. | No |

### Connect the free file store

Do this once. It takes about a minute.

1. Open [the All Auto TT project on Vercel](https://vercel.com/simeon-doolarsinghs-projects/all-auto-tt).
2. Click the **Storage** tab.
3. Click **Create Database** or **Create Store**, then choose **Blob**.
4. Name it `all-auto-tt`. Leave the access as **Private** if you see that choice.
5. Connect it to this project. Vercel fills in `BLOB_READ_WRITE_TOKEN` for you.
6. Redeploy the site (Deployments → the latest production deploy → Redeploy).
7. Open the homepage. The sample yards are there. The first save copies them into Blob so they are not lost when the site restarts.
8. Sign in as `admin@allautott.example` with the password in the table above, or sign up at `/dealer/signup` with `allautott@gmail.com`. That signup can open `/admin`.
9. Approve or reject shops at `/admin/dealers`. Remove a bad part at `/admin/listings`.

Dealers edit only their own shop and parts. They cannot approve themselves or change their plan. The site does not take payment for parts. Buyers still WhatsApp or call the dealer and pay on pickup.

The practice admin password is written in this README. After you are signed in, you can also sign up with your own email so that account is an admin too.

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
