import type { Metadata } from "next";
import { StudioNavbar } from "@/components/bookings/studio-navbar";
import { BookingsHero } from "@/components/bookings/bookings-hero";
import { BookingsTabs } from "@/components/bookings/bookings-tabs";
import { InkGallery } from "@/components/bookings/ink-gallery";
import { StudioCta } from "@/components/bookings/studio-cta";
import { StudioFooter } from "@/components/bookings/studio-footer";

export const metadata: Metadata = {
  title: "Book a Tattoo — 47Studio",
  description:
    "Book a tattoo session at 47cultures & Ink. Pick your style, size, and preferred date for a studio session or secure a spot on the 47Studio Kenya tour — Nairobi, Mombasa, Kisumu, Eldoret.",
  alternates: { canonical: "/bookings" },
  openGraph: {
    title: "Book a Tattoo — 47cultures & Ink",
    description:
      "Studio sessions & pop-up tour bookings for 47Studio Kenya. Fine line, geometric, blackwork, traditional and more.",
    type: "website",
  },
};

export default function BookingsPage() {
  return (
    <div className="bg-[#0a0a0c] text-stone-50 min-h-screen selection:bg-hazard selection:text-white">
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
    </div>
  );
}
