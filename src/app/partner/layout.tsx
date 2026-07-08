import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Partner",
  description: "Join the IQFITS-47 partner program and grow your business with us.",
  alternates: {
    canonical: "/partner",
  },
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
