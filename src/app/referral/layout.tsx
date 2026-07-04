import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer & Earn — IQFIT47",
  description:
    "Refer friends to IQFIT47 and earn KES 200–500 per successful referral. Your friend gets 5% off their first order. Climb the ranks from Bronze to Legend.",
  openGraph: {
    title: "Refer & Earn — IQFIT47",
    description:
      "Share IQFIT47 with your crew. They get 5% off kicks and streetwear. You earn cash credits.",
    url: "https://iqfits47.top/referral",
    siteName: "IQFIT47",
  },
};

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
