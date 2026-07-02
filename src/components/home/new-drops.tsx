import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getNewDrops } from "@/lib/data/products";

export async function NewDrops() {
  const drops = await getNewDrops();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-hazard">Just landed</p>
          <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
            New drops
          </h2>
        </div>
        <Link href="/shop" className="font-mono text-xs uppercase tracking-wide text-ink/50 hover:text-hazard">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {drops.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
