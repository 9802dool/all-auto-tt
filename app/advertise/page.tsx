import type { Metadata } from "next";
import { adRates, brand } from "@/lib/config";
import { formatPhone, telLink, waLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Advertise with ALL AUTO TT",
  description: "Banner ads for mechanics, tyre shops and insurers next to used parts searches in Trinidad and Tobago.",
};

export default function AdvertisePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-5xl font-extrabold uppercase">Advertise with us</h1>
      <p className="mt-3 text-muted-foreground">
        Mechanics, tyre shops, insurers and detailers can buy a banner next to people who are already shopping for parts. The admin schedules the creative, the dates and the placement. Impressions and clicks are counted.
      </p>
      <div className="mt-6 overflow-hidden rounded-3xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal text-white">
            <tr>
              <th className="px-4 py-3">Placement</th>
              <th className="px-4 py-3">Rate</th>
            </tr>
          </thead>
          <tbody>
            {adRates.map((rate) => (
              <tr key={rate.placement} className="border-t border-border bg-white">
                <td className="px-4 py-3">
                  <p className="font-semibold">{rate.placement}</p>
                  <p className="text-muted-foreground">{rate.note}</p>
                </td>
                <td className="px-4 py-3 font-semibold">{rate.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm">
        Email {brand.email} or WhatsApp {formatPhone(brand.whatsapp)} with the artwork, link and weeks you want.
      </p>
      <p className="mt-4 text-sm">
        Mechanics can print a <a className="font-semibold text-orange-ink" href={"/api/flyers/mechanics"}>Find parts fast flyer</a> with a QR code for the counter.
      </p>
      <div className="mt-4 flex gap-2">
        <a className="inline-flex h-11 items-center rounded-xl bg-whatsapp px-4 font-semibold text-white" href={waLink(brand.whatsapp, "Hi ALL AUTO TT, I want to advertise.")}>WhatsApp</a>
        <a className="inline-flex h-11 items-center rounded-xl border px-4 font-semibold" href={telLink(brand.phone)}>Call</a>
      </div>
    </main>
  );
}
