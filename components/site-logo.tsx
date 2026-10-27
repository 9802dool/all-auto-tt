import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  variant?: "header" | "footer";
  className?: string;
};

export function SiteLogo({ variant = "header", className }: SiteLogoProps) {
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label="ALL AUTO TT home"
    >
      {isFooter ? (
        <Image
          src="/brand/all-auto-tt-logo.jpg"
          alt="ALL AUTO TT"
          width={200}
          height={200}
          className="h-14 w-auto sm:h-16"
          priority
        />
      ) : (
        <>
          <Image
            src="/brand/logo-aa-light.png"
            alt=""
            width={808}
            height={500}
            className="h-8 w-auto sm:h-10"
            priority
            aria-hidden
          />
          <span className="ml-1.5 font-display text-[0.95rem] font-extrabold tracking-[0.06em] uppercase leading-none sm:ml-2 sm:text-xl sm:tracking-[0.12em]">
            <span className="text-charcoal">All Auto </span>
            <span className="text-orange">TT</span>
          </span>
        </>
      )}
    </Link>
  );
}
