import Link from "next/link";
import { Suspense } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { SiteLogo } from "@/components/site-logo";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { brand } from "@/lib/config";
import { formatPhone, telLink } from "@/lib/format";
import { cn } from "@/lib/utils";

const links = [
  ["/browse", "Browse"],
  ["/dealers", "Dealers"],
  ["/for-dealers", "For dealers"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
      <div className="bg-charcoal text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-xs sm:text-sm">
          <p>Trinidad & Tobago · Inspect first · Pay on pickup</p>
          <a className="font-semibold text-orange" href={telLink(brand.phone)}>
            {formatPhone(brand.phone)}
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <SiteLogo variant="header" className="min-w-0" />
        <nav className="ml-4 hidden items-center gap-5 text-sm font-semibold md:flex" aria-label="Primary">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-orange-ink">
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>Sign in</Link>}>
            <AccountLink />
          </Suspense>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

async function AccountLink() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
        Sign in
      </Link>
    );
  }
  const href = user.role === "admin" ? "/admin" : "/dealer";
  const label = user.role === "admin" ? "Admin" : "Dashboard";
  return (
    <Link href={href} className={cn(buttonVariants({ size: "lg" }))}>
      {label}
    </Link>
  );
}
