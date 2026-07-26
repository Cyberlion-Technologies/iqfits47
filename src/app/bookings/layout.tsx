import type { Metadata } from "next";

const SITE_URL = "https://iqfits47.store";
const STUDIO_OG_IMAGE = `${SITE_URL}/studio-logo.jpg`;

export const metadata: Metadata = {
  title: "47Studio | Tattoo Studio & Kenya Tour Bookings",
  description:
    "Book custom tattoo sessions, body art, piercings and Kenya pop-up tour stops (Nairobi, Mombasa, Kisumu, Eldoret) with 47Studio (47Cultures & Ink).",
  icons: {
    icon: "/studio-logo.jpg",
    shortcut: "/studio-logo.jpg",
    apple: "/studio-logo.jpg",
    other: [{ rel: "manifest", url: "/studio.webmanifest" }],
  },
  openGraph: {
    title: "47Studio | Tattoo Studio & Kenya Tour Bookings",
    description:
      "Official 47Cultures & Ink tattoo studio booking portal. Reserve private studio sessions or pop-up tour dates in Nairobi, Mombasa, Kisumu & Eldoret.",
    url: `${SITE_URL}/bookings`,
    siteName: "47Studio",
    locale: "en_KE",
    type: "website",
    images: [{ url: STUDIO_OG_IMAGE, width: 800, height: 800, alt: "47Studio Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "47Studio | Tattoo Studio & Kenya Tour Bookings",
    description: "Book private tattoo sessions and Kenya pop-up tour stops with 47Studio.",
    images: [STUDIO_OG_IMAGE],
  },
};

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
