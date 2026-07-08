import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View and manage your favorite sneakers and streetwear items.",
  alternates: {
    canonical: "/wishlist",
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
