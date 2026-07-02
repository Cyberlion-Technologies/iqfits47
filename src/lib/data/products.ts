import { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

const sizesRun = (stockPattern: number[]): { size: string; stock: number }[] =>
  ["38", "39", "40", "41", "42", "43", "44"].map((size, i) => ({
    size,
    stock: stockPattern[i] ?? 0,
  }));

export const products: Product[] = [
  {
    id: "p001",
    slug: "airwave-97-triple-white",
    name: "Airwave 97",
    brand: "Nike",
    category: "sneakers",
    price: 8500,
    compareAtPrice: 10500,
    description:
      "The Airwave 97 keeps the low-profile silhouette Nairobi runners love, done up in triple white leather with a gum sole for grip on Thika Road pavement.",
    details: [
      "Genuine leather upper",
      "Air cushioned sole unit",
      "Gum rubber outsole",
      "Comes with original box",
    ],
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80",
    ],
    colorway: "Triple White",
    sizes: sizesRun([2, 4, 6, 8, 6, 3, 1]),
    tags: ["low-top", "leather", "everyday"],
    isNewDrop: true,
    dropNumber: "DROP 014",
    rating: 4.8,
    reviewCount: 132,
  },
  {
    id: "p002",
    slug: "cortez-flux-black-red",
    name: "Cortez Flux",
    brand: "Nike",
    category: "sneakers",
    price: 7200,
    description:
      "A punchy black and hazard-red colorway of the classic runner silhouette. Lightweight foam midsole built for all-day wear around town.",
    details: ["Mesh and synthetic upper", "Foam midsole", "Reinforced toe cap"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80",
    ],
    colorway: "Black / Hazard Red",
    sizes: sizesRun([3, 5, 5, 7, 4, 2, 0]),
    tags: ["low-top", "running"],
    rating: 4.6,
    reviewCount: 84,
  },
  {
    id: "p003",
    slug: "streetform-og-cream",
    name: "Streetform OG",
    brand: "Adidas",
    category: "sneakers",
    price: 9800,
    compareAtPrice: 11500,
    description:
      "Suede and mesh paneling on a cream base with signature three-stripe branding. A wardrobe staple for anyone building a rotation.",
    details: ["Suede overlays", "Rubber cupsole", "Padded collar"],
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80",
      "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=1000&q=80",
    ],
    colorway: "Cream / Gum",
    sizes: sizesRun([1, 3, 6, 6, 5, 3, 2]),
    tags: ["suede", "retro"],
    isNewDrop: true,
    dropNumber: "DROP 013",
    rating: 4.9,
    reviewCount: 201,
  },
  {
    id: "p004",
    slug: "trailhigh-storm-grey",
    name: "Trailhigh Storm",
    brand: "New Balance",
    category: "sneakers",
    price: 11200,
    description:
      "Chunky trail-ready silhouette in storm grey with reflective accents. Built for weekend hikes around the Aberdares or Sunday errands in the CBD.",
    details: ["Water-resistant upper", "EVA midsole", "Reflective pull tabs"],
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80",
    ],
    colorway: "Storm Grey",
    sizes: sizesRun([2, 2, 4, 5, 4, 3, 1]),
    tags: ["chunky", "trail"],
    rating: 4.7,
    reviewCount: 58,
  },
  {
    id: "p005",
    slug: "court-classic-navy",
    name: "Court Classic",
    brand: "Converse",
    category: "sneakers",
    price: 5400,
    description:
      "Canvas high-top in navy with the original rubber toe cap. Simple, cheap to keep clean, and it goes with everything in your closet.",
    details: ["Canvas upper", "Vulcanized rubber sole", "Metal eyelets"],
    images: [
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1000&q=80",
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1000&q=80",
    ],
    colorway: "Navy",
    sizes: sizesRun([4, 6, 8, 8, 6, 4, 2]),
    tags: ["high-top", "canvas"],
    rating: 4.5,
    reviewCount: 176,
  },
  {
    id: "p006",
    slug: "runcore-volt-orange",
    name: "Runcore Volt",
    brand: "Puma",
    category: "sneakers",
    price: 7900,
    compareAtPrice: 9200,
    description:
      "Hazard-orange knit upper built for the daily commute. Breathable, light, and loud enough to spot from across the matatu stage.",
    details: ["Engineered knit upper", "Responsive foam sole", "Pull-tab heel"],
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&q=80",
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1000&q=80",
    ],
    colorway: "Hazard Orange",
    sizes: sizesRun([3, 4, 5, 6, 4, 2, 1]),
    tags: ["knit", "running"],
    isNewDrop: true,
    dropNumber: "DROP 014",
    rating: 4.4,
    reviewCount: 39,
  },
  {
    id: "j001",
    slug: "oversized-varsity-jacket-ink",
    name: "Oversized Varsity Jacket",
    brand: "IQFIT47 Label",
    category: "apparel",
    price: 6800,
    description:
      "Heavyweight wool-blend body with faux-leather sleeves. Cut oversized for the layered look, lined for Nairobi's cold mornings.",
    details: ["Wool-blend body", "Faux-leather sleeves", "Ribbed cuffs and hem", "Quilted lining"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&q=80",
    ],
    colorway: "Ink Black",
    sizes: [
      { size: "S", stock: 3 },
      { size: "M", stock: 6 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 2 },
    ],
    tags: ["outerwear", "oversized"],
    rating: 4.7,
    reviewCount: 61,
  },
  {
    id: "j002",
    slug: "boxy-graphic-tee-cream",
    name: "Boxy Graphic Tee",
    brand: "IQFIT47 Label",
    category: "apparel",
    price: 2200,
    description:
      "220gsm heavyweight cotton with a boxy drop-shoulder fit and a puff-print front graphic. Doesn't lose shape after wash.",
    details: ["220gsm cotton", "Drop-shoulder fit", "Puff-print graphic"],
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1000&q=80",
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1000&q=80",
    ],
    colorway: "Cream",
    sizes: [
      { size: "S", stock: 8 },
      { size: "M", stock: 10 },
      { size: "L", stock: 9 },
      { size: "XL", stock: 4 },
    ],
    tags: ["tee", "graphic"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.6,
    reviewCount: 97,
  },
  {
    id: "j003",
    slug: "cargo-utility-pants-olive",
    name: "Cargo Utility Pants",
    brand: "IQFIT47 Label",
    category: "apparel",
    price: 3600,
    description:
      "Ripstop cargo pants with six pockets and an adjustable waist. Tapered leg so they sit right over your kicks.",
    details: ["Ripstop cotton", "Six-pocket cargo build", "Adjustable waistband", "Tapered leg"],
    images: [
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1000&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1000&q=80",
    ],
    colorway: "Olive",
    sizes: [
      { size: "S", stock: 4 },
      { size: "M", stock: 7 },
      { size: "L", stock: 6 },
      { size: "XL", stock: 3 },
    ],
    tags: ["pants", "utility"],
    rating: 4.5,
    reviewCount: 44,
  },
  {
    id: "j004",
    slug: "hooded-fleece-slate",
    name: "Heavyweight Hoodie",
    brand: "IQFIT47 Label",
    category: "apparel",
    price: 3200,
    compareAtPrice: 3900,
    description:
      "400gsm brushed fleece, kangaroo pocket, ribbed hem. The one you reach for every single evening.",
    details: ["400gsm brushed fleece", "Kangaroo pocket", "Ribbed cuffs and hem"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000&q=80",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=1000&q=80",
    ],
    colorway: "Slate Grey",
    sizes: [
      { size: "S", stock: 5 },
      { size: "M", stock: 9 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 5 },
    ],
    tags: ["hoodie", "fleece"],
    rating: 4.8,
    reviewCount: 152,
  },
  {
    id: "a001",
    slug: "structured-cap-hazard",
    name: "Structured Cap",
    brand: "IQFIT47 Label",
    category: "accessories",
    price: 1500,
    description: "6-panel structured cap with an embroidered front logo and adjustable strap back.",
    details: ["Cotton twill", "Embroidered logo", "Adjustable strap"],
    images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1000&q=80"],
    colorway: "Hazard Orange",
    sizes: [{ size: "One Size", stock: 20 }],
    tags: ["cap", "headwear"],
    rating: 4.6,
    reviewCount: 33,
  },
  {
    id: "a002",
    slug: "canvas-tote-ink",
    name: "Canvas Utility Tote",
    brand: "IQFIT47 Label",
    category: "accessories",
    price: 1800,
    description: "Heavy canvas tote built to carry a fresh box of kicks without stretching out.",
    details: ["16oz canvas", "Reinforced base", "Interior pocket"],
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&q=80"],
    colorway: "Ink Black",
    sizes: [{ size: "One Size", stock: 15 }],
    tags: ["bag", "tote"],
    rating: 4.4,
    reviewCount: 21,
  },
  {
    id: "p007",
    slug: "flux-runner-cobalt",
    name: "Flux Runner",
    brand: "Adidas",
    category: "sneakers",
    price: 8900,
    description:
      "Electric cobalt overlays on a stone-grey knit base. Boost-style midsole for the days you're on your feet from Section 9 to the CBD and back.",
    details: ["Primeknit-style upper", "Boost-style midsole", "Torsion support"],
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
    ],
    colorway: "Cobalt / Stone",
    sizes: sizesRun([2, 3, 5, 6, 5, 3, 1]),
    tags: ["knit", "running"],
    rating: 4.7,
    reviewCount: 69,
  },
];

function mapDbProductToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    description: row.description,
    details: Array.isArray(row.details) ? row.details : JSON.parse(JSON.stringify(row.details || [])),
    images: Array.isArray(row.images) ? row.images : JSON.parse(JSON.stringify(row.images || [])),
    colorway: row.colorway,
    sizes: Array.isArray(row.sizes) ? row.sizes : JSON.parse(JSON.stringify(row.sizes || [])),
    tags: Array.isArray(row.tags) ? row.tags : JSON.parse(JSON.stringify(row.tags || [])),
    isNewDrop: row.is_new_drop ?? undefined,
    dropNumber: row.drop_number ?? undefined,
    rating: Number(row.rating ?? 5.0),
    reviewCount: row.review_count ?? 0,
  };
}

export async function getDbProducts(): Promise<Product[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return products;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return products;
    }

    return data.map(mapDbProductToProduct);
  } catch (e) {
    console.error("Error fetching products from DB, falling back to static:", e);
    return products;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return products.find((p) => p.slug === slug) ?? null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return products.find((p) => p.slug === slug) ?? null;
    }

    return mapDbProductToProduct(data);
  } catch (e) {
    console.error(`Error fetching product ${slug} from DB, falling back to static:`, e);
    return products.find((p) => p.slug === slug) ?? null;
  }
}

export async function getNewDrops(): Promise<Product[]> {
  const all = await getDbProducts();
  return all.filter((p) => p.isNewDrop);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getDbProducts();
  return all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export const categories: { id: Product["category"]; label: string; blurb: string }[] = [
  { id: "sneakers", label: "Kicks", blurb: "Sneakers worth queuing for" },
  { id: "apparel", label: "Apparel", blurb: "Designer fits, everyday wear" },
  { id: "accessories", label: "Accessories", blurb: "Caps, bags and finishing pieces" },
];
