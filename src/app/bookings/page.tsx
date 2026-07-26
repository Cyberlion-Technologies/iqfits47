import type { Metadata } from "next";
import { StudioNavbar } from "@/components/bookings/studio-navbar";
import { BookingsHero } from "@/components/bookings/bookings-hero";
import { BookingsTabs } from "@/components/bookings/bookings-tabs";
import { InkGallery } from "@/components/bookings/ink-gallery";
import { StudioCta } from "@/components/bookings/studio-cta";
import { StudioFooter } from "@/components/bookings/studio-footer";
import { MobileFloatingCta } from "@/components/bookings/mobile-floating-cta";

const SITE_URL = "https://iqfits47.store";
const STUDIO_OG_IMAGE = `${SITE_URL}/studio-logo.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Book a Tattoo — 47Studio (47Cultures & Ink)",
  description:
    "Book a tattoo session at 47cultures & Ink Nairobi. Fine line, geometric, blackwork, neo-traditional body art & Kenya pop-up tour dates in Mombasa, Kisumu, Eldoret.",
  alternates: { canonical: "/bookings" },
  icons: {
    icon: "/studio-logo.jpg",
    shortcut: "/studio-logo.jpg",
    apple: "/studio-logo.jpg",
    other: [{ rel: "manifest", url: "/studio.webmanifest" }],
  },
  openGraph: {
    title: "47Studio — Tattoo • Piercing • Body Art | Nairobi Kenya",
    description:
      "Book a tattoo session at 47cultures & Ink. Pick your style, size, and date or secure a spot on the 47Studio Kenya Tour.",
    url: `${SITE_URL}/bookings`,
    siteName: "47Studio",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: STUDIO_OG_IMAGE,
        width: 800,
        height: 800,
        alt: "47Cultures & Ink — Tattoo Studio Nairobi Kenya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "47Studio Tattoo Bookings — Nairobi Kenya",
    description:
      "Fine Line, Geometric, Blackwork & Custom Body Art. Studio sessions & Kenya Tour pop-ups.",
    images: [STUDIO_OG_IMAGE],
  },
};

export default function BookingsPage() {
  return (
    <div className="bg-[#0a0a0c] text-stone-50 min-h-screen selection:bg-hazard selection:text-white pb-20 md:pb-0">
      <StudioNavbar />
      <main>
        <BookingsHero />
        <BookingsTabs />
        <section id="portfolio">
          <InkGallery />
        </section>
        <StudioCta />
      </main>
      <StudioFooter />
      {/* Mobile Sticky CTA */}
      <MobileFloatingCta />
    </div>
  );
}
