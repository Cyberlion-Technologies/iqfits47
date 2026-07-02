import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { ClientWrapper } from "@/components/layout/client-wrapper";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iqfits47.top"),
  title: {
    default: "IQFIT47 — Kicks, Sneakers & Designer Fits",
    template: "%s | IQFIT47",
  },
  description:
    "IQFIT47 is Kenya's home for authentic kicks, streetwear and designer clothing. Shop drops, track your order, pay with M-Pesa.",
  keywords: [
    "sneakers Kenya",
    "kicks Nairobi",
    "designer clothing Kenya",
    "streetwear Nairobi",
    "IQFIT47",
    "buy shoes online Kenya",
  ],
  openGraph: {
    title: "IQFIT47 — Kicks, Sneakers & Designer Fits",
    description:
      "Authentic kicks and designer fits, delivered across Kenya. Pay with M-Pesa, track every order.",
    url: "https://iqfits47.top",
    siteName: "IQFIT47",
    locale: "en_KE",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#15151A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-stone-50 font-body text-ink antialiased">
        <ClientWrapper>
          {children}
        </ClientWrapper>
        <Footer />
      </body>
    </html>
  );
}
