import { Suspense } from "react";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { getDbProducts, categories } from "@/lib/data/products";
import nextDynamic from "next/dynamic";

const ProductCard = nextDynamic(() => import("@/components/product/product-card").then((m) => m.ProductCard));
const ShopFilters = nextDynamic(() => import("@/components/product/shop-filters").then((m) => m.ShopFilters));
import { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse every kick, apparel piece and accessory in the IQFITS-47 catalogue.",
};

function sortProducts(list: Product[], sort: string) {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "newest":
      return copy.sort((a, b) => Number(b.isNewDrop) - Number(a.isNewDrop));
    default:
      return copy;
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const { category, sort, q } = await searchParams;
  const productsList = await getDbProducts();

  let filtered = productsList;
  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        (p.colorway && p.colorway.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query)
    );
  }

  filtered = sortProducts(filtered, sort ?? "featured");

  const activeLabel = q 
    ? `Search Results for "${q}"`
    : (categories.find((c) => c.id === category)?.label ?? "All Products");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wide text-hazard">Catalogue</p>
        <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl">
          {activeLabel}
        </h1>
        <p className="mt-2 text-sm text-ink/50">{filtered.length} items</p>
      </div>

      <Suspense>
        <ShopFilters />
      </Suspense>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 py-24 text-center">
          <p className="font-display text-xl uppercase">Nothing here yet</p>
          <p className="mt-1 text-sm text-ink/50">Check back for the next drop.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
