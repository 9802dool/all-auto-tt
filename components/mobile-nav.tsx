"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  ["/browse", "Browse parts"],
  ["/dealers", "Dealers"],
  ["/request", "Request a part"],
  ["/new", "New arrivals"],
  ["/for-dealers", "For dealers"],
  ["/advertise", "Advertise"],
  ["/safety", "Buyer safety"],
];

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex size-11 items-center justify-center rounded-lg border border-border md:hidden" aria-label="Open menu">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,20rem)]">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl uppercase">Menu</SheetTitle>
        </SheetHeader>
        <nav className="grid gap-1 px-4 pb-6">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted">
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
