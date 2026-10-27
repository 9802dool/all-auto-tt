import { brand } from "@/lib/config";
import { formatPhone, partSearchRequestMessage, waLink } from "@/lib/format";

export function RequestPartButton({
  search,
  prominent = false,
}: {
  search: {
    make?: string;
    model?: string;
    year?: string | number;
    part?: string;
    keywords?: string;
  };
  prominent?: boolean;
}) {
  const href = waLink(brand.whatsapp, partSearchRequestMessage(search));
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        prominent
          ? "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-orange px-5 py-3 text-center text-base font-semibold text-charcoal hover:bg-orange-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal sm:w-auto"
          : "inline-flex min-h-11 items-center justify-center rounded-xl bg-orange px-4 py-2 text-center text-sm font-semibold text-charcoal hover:bg-orange-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
      }
    >
      Can&apos;t find it? Request this part
      <span className="sr-only"> on WhatsApp at {formatPhone(brand.whatsapp)}</span>
    </a>
  );
}
