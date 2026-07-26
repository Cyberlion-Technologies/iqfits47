import type { Metadata } from "next";

const SITE_URL = "https://iqfits47.store";
const STUDIO_OG_IMAGE = `${SITE_URL}/studio-logo.jpg`;

export const metadata: Metadata = {
  title: "47Studio Console | Operations & Booking Management",
  description: "Manage 47Studio tattoo bookings, Kenya tour dates, slot capacities & pricing policies.",
  icons: {
    icon: "/studio-logo.jpg",
    shortcut: "/studio-logo.jpg",
    apple: "/studio-logo.jpg",
    other: [{ rel: "manifest", url: "/studio.webmanifest" }],
  },
  openGraph: {
    title: "47Studio Management Console",
    description: "47Cultures & Ink Operations Portal",
    images: [{ url: STUDIO_OG_IMAGE, width: 800, height: 800, alt: "47Studio Logo" }],
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
