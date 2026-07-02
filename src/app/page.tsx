import dynamic from "next/dynamic";
import { CategoryShelf } from "@/components/home/category-shelf";
import { TrustStrip } from "@/components/home/trust-strip";
import { InstagramCta } from "@/components/home/instagram-cta";

const Hero = dynamic(() => import("@/components/home/hero").then((m) => m.Hero));
const NewDrops = dynamic(() => import("@/components/home/new-drops").then((m) => m.NewDrops));

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <NewDrops />
      <CategoryShelf />
      <InstagramCta />
    </>
  );
}
