import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your IQFITS-47 order status and delivery updates.",
  alternates: {
    canonical: "/track-order",
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
