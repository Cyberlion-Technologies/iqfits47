import type { Metadata } from "next";
import { BookingsHero } from "@/components/bookings/bookings-hero";
import { BookingsTabs } from "@/components/bookings/bookings-tabs";
import { InkGallery } from "@/components/bookings/ink-gallery";
import { StudioCta } from "@/components/bookings/studio-cta";

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
    <main className="bg-ink text-stone-50 min-h-screen">
      <BookingsHero />
      <BookingsTabs />
      <InkGallery />
      <StudioCta />
    </main>
  );
}
