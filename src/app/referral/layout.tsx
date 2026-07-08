import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer & Earn — IQFITS-47",
  description:
    "Refer friends to IQFITS-47 and earn KES 200–500 per successful referral. Your friend gets 5% off their first order. Climb the ranks from Bronze to Legend.",
  alternates: {
    canonical: "/referral",
  },
  openGraph: {
    title: "Refer & Earn — IQFITS-47",
    description:
      "Share IQFITS-47 with your crew. They get 5% off kicks and streetwear. You earn cash credits.",
    url: "https://iqfits47.store/referral",
    siteName: "IQFITS-47",
  },
};

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
