import { notFound } from "next/navigation";
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
import { getProductBySlug, getRelatedProducts, getDbProducts } from "@/lib/data/products";
import dynamic from "next/dynamic";

const ProductGallery = dynamic(() => import("@/components/product/product-gallery").then((m) => m.ProductGallery));
const AddToCartForm = dynamic(() => import("@/components/product/add-to-cart-form").then((m) => m.AddToCartForm));
const ProductCard = dynamic(() => import("@/components/product/product-card").then((m) => m.ProductCard));
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

  const title = `${product.name} - ${product.brand} | IQFIT47`;
  const description = `${product.description} Shop authentic ${product.brand} sneakers and streetwear at IQFIT47 Nairobi store. Next-day delivery.`;
  const url = `https://iqfits47.top/product/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.images[0]],
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand,
    },
    "color": product.colorway,
    "offers": {
      "@type": "Offer",
      "url": `https://iqfits47.top/product/${product.slug}`,
      "priceCurrency": "KES",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.sizes.some((s) => s.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </div>
  );
}
