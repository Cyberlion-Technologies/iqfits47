import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";

function StarIcon({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
import { getProductBySlug, getRelatedProducts, getDbProducts, categories } from "@/lib/data/products";
import Link from "next/link";
import nextDynamic from "next/dynamic";

const ProductGallery = nextDynamic(() => import("@/components/product/product-gallery").then((m) => m.ProductGallery));
const AddToCartForm = nextDynamic(() => import("@/components/product/add-to-cart-form").then((m) => m.AddToCartForm));
const ProductCard = nextDynamic(() => import("@/components/product/product-card").then((m) => m.ProductCard));
const RecentlyViewedTracker = nextDynamic(() => import("@/components/product/recently-viewed-tracker").then((m) => m.RecentlyViewedTracker));
const RecentlyViewedShelf = nextDynamic(() => import("@/components/product/recently-viewed-shelf").then((m) => m.RecentlyViewedShelf));
const OutfitBuilder = nextDynamic(() => import("@/components/product/outfit-builder").then((m) => m.OutfitBuilder));
import { formatKES } from "@/lib/utils";

export async function generateStaticParams() {
  const list = await getDbProducts();
  return list.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = `${product.name} — ${product.brand} | Buy Online Kenya | IQFITS-47`;

  // Rich, keyword-dense description for Google Search snippets
  const availableSizes = product.sizes
    .filter((s) => s.stock > 0)
    .map((s) => s.size)
    .join(", ");
  const inStock = product.sizes.some((s) => s.stock > 0);
  const description = [
    product.description,
    `Shop authentic ${product.brand} ${product.name} (${product.colorway}) at IQFITS-47 — Kenya's trusted sneaker store.`,
    inStock
      ? `Available sizes: ${availableSizes}.`
      : "Currently out of stock — check back soon.",
    `Pay with M-Pesa. Fast delivery across Nairobi and Kenya (1–4 days). 100% original, genuine ${product.brand}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const url = `https://iqfits47.store/product/${product.slug}`;
  const primaryImage = product.images[0];

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand,
      `${product.brand} Kenya`,
      `${product.name} Kenya`,
      `buy ${product.brand} Kenya`,
      `${product.name} price Kenya`,
      `${product.colorway}`,
      `authentic ${product.brand} Kenya`,
      `original ${product.brand} Nairobi`,
      "sneakers Kenya",
      "IQFITS-47",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "IQFITS-47",
      locale: "en_KE",
      // "og:type": "product" helps Facebook & Pinterest product discovery
      type: "website",
      images: product.images.slice(0, 4).map((img, i) => ({
        url: img,
        width: 800,
        height: 800,
        alt: i === 0 ? product.name : `${product.name} — view ${i + 1}`,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
    other: {
      // Open Graph product meta — used by Pinterest, Facebook Shops
      "product:price:amount": String(product.price),
      "product:price:currency": "KES",
      "product:availability": inStock ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": product.brand,
      "product:retailer_item_id": product.slug,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  const productUrl = `https://iqfits47.store/product/${product.slug}`;

  const inStock = product.sizes.some((s) => s.stock > 0);

  // Per-size offers — gives Google granular size availability
  const sizeOffers = product.sizes.map((variant) => ({
    "@type": "Offer",
    "url": productUrl,
    "priceCurrency": "KES",
    "price": product.price,
    "itemCondition": "https://schema.org/NewCondition",
    "availability": variant.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    "size": variant.size,
    "seller": {
      "@type": "Organization",
      "name": "IQFITS-47",
      "url": "https://iqfits47.store",
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": 0,
        "currency": "KES",
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "KE",
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "DAY",
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 4,
          "unitCode": "DAY",
        },
      },
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "KE",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 7,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn",
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productUrl,
    "name": product.name,
    "image": product.images,
    "description": [
      product.description,
      `Authentic ${product.brand} ${product.name} in ${product.colorway} colorway.`,
      `Shop original ${product.brand} sneakers at IQFITS-47 — Kenya's trusted sneaker store.`,
      `Pay with M-Pesa. Fast delivery across Nairobi and Kenya.`,
    ].join(" "),
    // SKU = slug for Google Merchant Center matching
    "sku": product.slug,
    // MPN helps Google cross-reference with product catalog
    "mpn": product.slug.toUpperCase(),
    "identifier_exists": "false",
    "brand": {
      "@type": "Brand",
      "name": product.brand,
    },
    "color": product.colorway,
    // Google Merchant Center category taxonomy
    "category": product.category === "sneakers"
      ? "Apparel & Accessories > Shoes"
      : product.category === "apparel"
      ? "Apparel & Accessories > Clothing"
      : "Apparel & Accessories",
    // Size system for footwear — helps GMC
    ...(product.category === "sneakers" && {
      "size": product.sizes
        .filter((s) => s.stock > 0)
        .map((s) => s.size)
        .join(", "),
      "sizeSystem": "EU",
    }),
    // Offer: use AggregateOffer if multiple sizes, else single Offer
    "offers": product.sizes.length > 1
      ? {
          "@type": "AggregateOffer",
          "url": productUrl,
          "priceCurrency": "KES",
          "lowPrice": product.price,
          "highPrice": product.price,
          "offerCount": product.sizes.filter((s) => s.stock > 0).length,
          "availability": inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          "itemCondition": "https://schema.org/NewCondition",
          "offers": sizeOffers,
        }
      : sizeOffers[0],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount,
      "bestRating": 5,
      "worstRating": 1,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://iqfits47.store",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://iqfits47.store/shop",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": productUrl,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <RecentlyViewedTracker slug={product.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center space-x-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-ink/40 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link href="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <span className="text-ink/15">/</span>
        <Link href="/shop" className="hover:text-ink transition-colors">
          Shop
        </Link>
        <span className="text-ink/15">/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-ink transition-colors">
          {categories.find((c) => c.id === product.category)?.label || product.category}
        </Link>
        <span className="text-ink/15">/</span>
        <span className="text-ink/80 truncate max-w-[180px] sm:max-w-none">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="flex items-center gap-2">
            {product.isNewDrop && (
              <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-stone-50">
                {product.dropNumber}
              </span>
            )}
            <span className="font-mono text-xs uppercase tracking-wide text-ink/40">
              {product.brand}
            </span>
          </div>

          <h1 className="mt-2 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-ink/50">{product.colorway}</p>

          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                size={14}
                className={i < Math.round(product.rating) ? "fill-hazard text-hazard" : "text-ink/15"}
              />
            ))}
            <span className="ml-1 font-mono text-xs text-ink/50">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-2xl">{formatKES(product.price)}</span>
            {product.compareAtPrice && (
              <span className="font-mono text-base text-ink/40 line-through">
                {formatKES(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.description}</p>

          <div className="my-6 border-t border-dashed border-ink/15" />

          <AddToCartForm product={product} />

          <div className="mt-8">
            <h3 className="font-display text-sm uppercase tracking-wide">Details</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-ink/60">
              {product.details.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-hazard" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl bg-stone-100 p-4 text-xs text-ink/50">
            Pay securely with M-Pesa at checkout. Delivery within Nairobi &amp;
            Kiambu in 1–2 days, nationwide in 2–4 days. Track your order
            anytime with your order number.
          </div>

          <OutfitBuilder currentProduct={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl uppercase tracking-tight">You might also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewedShelf excludeId={product.id} />
    </div>
  );
}
