"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PortalNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col" aria-label="Dashboard">
      {items.map((item) => {
        const exact = item.href === "/dealer" || item.href === "/admin";
        const active = exact ? path === item.href : path === item.href || path.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3 py-2 text-sm font-semibold lg:rounded-xl",
              active ? "bg-charcoal text-white" : "bg-white text-charcoal hover:bg-muted",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
