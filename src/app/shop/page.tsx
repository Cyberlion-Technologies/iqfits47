import { Suspense } from "react";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { getDbProducts, categories } from "@/lib/data/products";
import nextDynamic from "next/dynamic";
import Link from "next/link";

const ProductCard = nextDynamic(() => import("@/components/product/product-card").then((m) => m.ProductCard));
const ShopFilters = nextDynamic(() => import("@/components/product/shop-filters").then((m) => m.ShopFilters));
import { Product } from "@/lib/types";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string; brand?: string }>;
}): Promise<Metadata> {
  const { category, brand, q } = await searchParams;

  let title = "Shop All";
  let description = "Browse every kick, apparel piece and accessory in the IQFITS-47 catalogue.";

  if (brand) {
    const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
    title = `Shop ${formattedBrand} | Sneakers & Streetwear`;
    description = `Shop authentic ${formattedBrand} sneakers, streetwear, and clothing at IQFITS-47. Fast delivery in Nairobi and countrywide in Kenya.`;
  } else if (category && category !== "all") {
    const catLabel = categories.find((c) => c.id === category)?.label ?? category;
    title = `Shop ${catLabel}`;
    description = `Browse our collection of authentic ${catLabel.toLowerCase()} at IQFITS-47. Original sneakers, streetwear, and designer fits.`;
  } else if (q) {
    title = `Search: ${q}`;
  }

  let canonicalPath = "/shop";
  if (category && category !== "all") {
    canonicalPath = `/shop?category=${category}`;
  } else if (brand) {
    canonicalPath = `/shop?brand=${brand}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
  };
}

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
  searchParams: Promise<{ category?: string; sort?: string; q?: string; brand?: string }>;
}) {
  const { category, sort, q, brand } = await searchParams;
  const productsList = await getDbProducts();

  let filtered = productsList;
  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (brand) {
    const brandLower = brand.toLowerCase();
    filtered = filtered.filter((p) => p.brand.toLowerCase() === brandLower);
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
    : brand
      ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} Collection`
      : (categories.find((c) => c.id === category)?.label ?? "All Products");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center space-x-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-ink/40">
        <Link href="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <span className="text-ink/15">/</span>
        {category || brand || q ? (
          <>
            <Link href="/shop" className="hover:text-ink transition-colors">
              Shop
            </Link>
            <span className="text-ink/15">/</span>
            <span className="text-ink/85">
              {q 
                ? "Search"
                : brand 
                  ? (brand.charAt(0).toUpperCase() + brand.slice(1))
                  : (categories.find((c) => c.id === category)?.label ?? category)}
            </span>
          </>
        ) : (
          <span className="text-ink/85">Shop</span>
        )}
      </nav>

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
