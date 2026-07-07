import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { ClientWrapper } from "@/components/layout/client-wrapper";
import { StructuredData } from "@/components/layout/structured-data";
import { Analytics } from "@vercel/analytics/next";

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

const SITE_URL = "https://iqfits47.store";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  applicationName: "IQFITS-47",

  title: {
    default: "IQFITS-47 — Original Kicks, Sneakers & Designer Fits in Kenya",
    template: "%s | IQFITS-47",
  },

  description:
    "IQFITS-47 is Kenya's trusted store for authentic sneakers, streetwear and designer clothing. Shop original Nike, Adidas, New Balance, Jordan and more in Nairobi. Pay with M-Pesa. Fast delivery across Kenya.",

  keywords: [
    // ── Core brand ──────────────────────────────────────────
    "IQFITS-47",
    "IQFITS47",
    "IQ Fits",
    "IQ Fits Kenya",

    // ── Sneakers — high-intent Kenya ─────────────────────────
    "sneakers Kenya",
    "sneakers Nairobi",
    "buy sneakers online Kenya",
    "original sneakers Kenya",
    "authentic sneakers Nairobi",
    "sneakers for men Kenya",
    "sneakers for women Kenya",
    "affordable sneakers Nairobi",
    "cheap sneakers Kenya",
    "best sneakers Kenya",
    "sneakers shop Nairobi",
    "sneaker store Kenya",
    "buy sneakers Nairobi",
    "new sneakers Kenya",
    "latest sneakers Kenya 2025",

    // ── Kicks ────────────────────────────────────────────────
    "kicks Kenya",
    "kicks Nairobi",
    "buy kicks online Kenya",
    "original kicks Kenya",
    "kicks shop Nairobi",

    // ── Nike ─────────────────────────────────────────────────
    "Nike Kenya",
    "Nike shoes Kenya",
    "Nike Air Force 1 Kenya",
    "Nike Air Force 1 white Kenya",
    "Nike Dunk Low Kenya",
    "Nike Dunk High Kenya",
    "Nike Air Max Kenya",
    "Nike Air Max 90 Kenya",
    "Nike Air Max 270 Kenya",
    "Nike Air Max 95 Kenya",
    "Nike Cortez Kenya",
    "Nike SB Kenya",
    "Nike React Kenya",
    "buy Nike Kenya",

    // ── Adidas ───────────────────────────────────────────────
    "Adidas Kenya",
    "Adidas shoes Kenya",
    "Adidas Samba Kenya",
    "Adidas Samba OG Kenya",
    "Adidas Gazelle Kenya",
    "Adidas Stan Smith Kenya",
    "Adidas Superstar Kenya",
    "Adidas NMD Kenya",
    "Adidas Ultraboost Kenya",
    "Adidas Forum Kenya",
    "buy Adidas Kenya",

    // ── New Balance ───────────────────────────────────────────
    "New Balance Kenya",
    "New Balance 550 Kenya",
    "New Balance 574 Kenya",
    "New Balance 990 Kenya",
    "New Balance 530 Kenya",
    "New Balance 327 Kenya",
    "buy New Balance Kenya",

    // ── Jordan / Air Jordan ───────────────────────────────────
    "Jordan shoes Kenya",
    "Air Jordan Kenya",
    "Air Jordan 1 Kenya",
    "Air Jordan 4 Kenya",
    "Air Jordan 11 Kenya",
    "Jordan 1 Low Kenya",
    "Jordan 4 Retro Kenya",
    "buy Jordans Kenya",

    // ── Other brands ──────────────────────────────────────────
    "Yeezy Kenya",
    "Yeezy Boost Kenya",
    "Puma Kenya",
    "Puma shoes Kenya",
    "Asics Kenya",
    "Converse Kenya",
    "Vans Kenya",
    "Reebok Kenya",
    "Salomon Kenya",

    // ── Streetwear ────────────────────────────────────────────
    "streetwear Kenya",
    "streetwear Nairobi",
    "streetwear clothing Kenya",
    "designer clothing Kenya",
    "designer fits Kenya",
    "urban fashion Kenya",
    "fashion Nairobi",
    "streetwear brands Kenya",
    "hypebeast Kenya",
    "sneaker culture Kenya",

    // ── Apparel ───────────────────────────────────────────────
    "streetwear hoodies Kenya",
    "graphic tees Kenya",
    "oversized tees Kenya",
    "cargo pants Kenya",
    "caps Kenya",
    "beanies Kenya",
    "socks Kenya",
    "snapback Kenya",

    // ── Trust + payment signals ───────────────────────────────
    "original shoes Kenya",
    "genuine sneakers Kenya",
    "trusted sneaker store Kenya",
    "legit sneakers Kenya",
    "100% authentic sneakers Kenya",
    "M-Pesa sneakers",
    "pay M-Pesa shoes",
    "buy shoes with M-Pesa",
    "M-Pesa online shopping shoes",

    // ── Delivery signals ──────────────────────────────────────
    "next day delivery Nairobi shoes",
    "fast shoe delivery Kenya",
    "same day delivery shoes Nairobi",
    "online shoe store Kenya",
    "shoe delivery Nairobi",
    "countrywide shoe delivery Kenya",

    // ── Google Shopping signals ───────────────────────────────
    "men shoes Kenya buy online",
    "women shoes Kenya buy online",
    "kids sneakers Kenya",
    "size 40 sneakers Kenya",
    "size 41 sneakers Kenya",
    "size 42 sneakers Kenya",
    "size 43 sneakers Kenya",
    "size 44 sneakers Kenya",
    "size 45 sneakers Kenya",
    "sneakers under 5000 Kenya",
    "sneakers under 10000 Kenya",
    "sneakers under 15000 Kenya",
  ],

  authors: [{ name: "IQFITS-47", url: SITE_URL }],
  creator: "IQFITS-47",
  publisher: "IQFITS-47",
  category: "Shopping",

  alternates: {
    canonical: SITE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "IQFITS-47 — Original Kicks, Sneakers & Designer Fits in Kenya",
    description:
      "Authentic sneakers and designer fits, delivered across Kenya. Shop Nike, Adidas, New Balance, Jordan & more. Pay with M-Pesa — fast delivery in Nairobi.",
    url: SITE_URL,
    siteName: "IQFITS-47",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "IQFITS-47 — Kicks, Streetwear & Designer Fits in Kenya",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "IQFITS-47 — Original Kicks & Designer Fits in Kenya",
    description:
      "Kenya's home for authentic kicks, streetwear and designer clothing. Pay with M-Pesa. Fast delivery.",
    images: [OG_IMAGE],
    site: "@iqfits47",
    creator: "@iqfits47",
  },

  icons: {
    icon: [
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icon.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.png?v=2",
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },

  verification: {
    // TODO: Add your Google Search Console verification token here once generated:
    // google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
    // Bing / Microsoft Clarity:
    // other: { "msvalidate.01": "YOUR_BING_TOKEN" },
  },

  other: {
    // Google Merchant Center association — fill in once GMC account is verified
    "google-site-verification": "",
    // Microsoft Application Insights / Clarity
    "msapplication-TileColor": "#15151A",
    "msapplication-config": "/browserconfig.xml",
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
      <head>
        <StructuredData />
      </head>
      <body className="bg-stone-50 font-body text-ink antialiased">
        <ClientWrapper>
          {children}
        </ClientWrapper>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
