import type { Metadata } from "next";
import { Suspense } from "react";
import { Barlow_Condensed, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThirdPartyAnalytics } from "@/components/analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { brand } from "@/lib/config";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || brand.url),
  title: {
    default: "ALL AUTO TT — Used car parts in Trinidad & Tobago",
    template: "%s | ALL AUTO TT",
  },
  description:
    "Find used engines, gearboxes and foreign-used parts in Trinidad and Tobago. Browse every dealer, WhatsApp them, and pay on pickup.",
  applicationName: brand.name,
  openGraph: {
    siteName: brand.name,
    locale: "en_TT",
    type: "website",
    images: [
      {
        url: "/brand/all-auto-tt-logo.jpg",
        width: 1024,
        height: 1024,
        alt: "ALL AUTO TT — used car parts in Trinidad and Tobago",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/all-auto-tt-logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-TT" className={`${outfit.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-foreground">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        <SiteHeader />
        <div id="content" className="flex-1">
          {children}
        </div>
        <SiteFooter />
        <Suspense fallback={null}>
          <WhatsAppFloat />
        </Suspense>
        <Analytics />
        <ThirdPartyAnalytics />
      </body>
    </html>
  );
}
