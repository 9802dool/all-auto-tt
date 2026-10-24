import Link from "next/link";
import { brand } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-charcoal text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src="/logo.svg" alt="" className="h-9 w-auto brightness-0 invert" />
          <p className="mt-3 max-w-xs text-sm text-zinc-300">{brand.tagline}</p>
        </div>
        <div>
          <h2 className="font-display text-lg tracking-wide uppercase">Buyers</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li><Link href="/browse">Browse parts</Link></li>
            <li><Link href="/request">Request a part</Link></li>
            <li><Link href="/new">New arrivals</Link></li>
            <li><Link href="/safety">Safety tips</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg tracking-wide uppercase">Dealers</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li><Link href="/for-dealers">Plans and pricing</Link></li>
            <li><Link href="/dealer/signup">Create an account</Link></li>
            <li><Link href="/advertise">Advertise</Link></li>
            <li><Link href="/dealers">Dealer directory</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg tracking-wide uppercase">Platform</h2>
          <p className="mt-3 text-sm text-zinc-300">
            ALL AUTO TT does not sell parts. Dealers list stock. Buyers pay the dealer on pickup.
          </p>
          <p className="mt-3 text-sm text-zinc-400">{brand.domain}</p>
        </div>
      </div>
    </footer>
  );
}
