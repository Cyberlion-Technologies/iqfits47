import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
export const dynamic = "force-dynamic";
import { CategoryShelf } from "@/components/home/category-shelf";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};
import { TrustStrip } from "@/components/home/trust-strip";
import { InstagramCta } from "@/components/home/instagram-cta";

const Hero = nextDynamic(() => import("@/components/home/hero").then((m) => m.Hero));
const NewDrops = nextDynamic(() => import("@/components/home/new-drops").then((m) => m.NewDrops));
const TopReferrer = nextDynamic(() => import("@/components/home/top-referrer").then((m) => m.TopReferrer));

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <NewDrops />
      <CategoryShelf />
      <TopReferrer />
      <InstagramCta />
    </>
  );
}
