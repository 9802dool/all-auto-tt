"use client";

import { usePathname } from "next/navigation";
import { brand } from "@/lib/config";
import { waLink } from "@/lib/format";

export function WhatsAppFloat() {
  const pathname = usePathname();
  const lifted = pathname.startsWith("/parts/");
  const href = waLink(brand.whatsapp, "Hi ALL AUTO TT, I need help finding a part.");
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-white shadow-lg ${lifted ? "bottom-24 md:bottom-6" : "bottom-5"}`}
    >
      <span aria-hidden="true">WhatsApp</span>
      <span className="sr-only">Message ALL AUTO TT on WhatsApp</span>
    </a>
  );
}
