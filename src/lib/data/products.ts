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
    price: 6500,
    compareAtPrice: 8500,
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
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80"
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
    price: 5200,
    compareAtPrice: 6500,
    description:
      "A punchy black and hazard-red colorway of the classic runner silhouette. Lightweight foam midsole built for all-day wear around town.",
    details: ["Mesh and synthetic upper", "Foam midsole", "Reinforced toe cap"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80"
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
    price: 6800,
    compareAtPrice: 8500,
    description:
      "Suede and mesh paneling on a cream base with signature three-stripe branding. A wardrobe staple for anyone building a rotation.",
    details: ["Suede overlays", "Rubber cupsole", "Padded collar"],
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80",
      "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=1000&q=80"
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
    price: 7200,
    compareAtPrice: 9000,
    description:
      "Chunky trail-ready silhouette in storm grey with reflective accents. Built for weekend hikes around the Aberdares or Sunday errands in the CBD.",
    details: ["Water-resistant upper", "EVA midsole", "Reflective pull tabs"],
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80"
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
    price: 4500,
    compareAtPrice: 5800,
    description:
      "Canvas high-top in navy with the original rubber toe cap. Simple, cheap to keep clean, and it goes with everything in your closet.",
    details: ["Canvas upper", "Vulcanized rubber sole", "Metal eyelets"],
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1000&q=80",
      "https://images.unsplash.com/photo-1594931984260-b74c8ecba2df?w=1000&q=80"
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
    price: 5800,
    compareAtPrice: 7500,
    description:
      "Hazard-orange knit upper built for the daily commute. Breathable, light, and loud enough to spot from across the matatu stage.",
    details: ["Engineered knit upper", "Responsive foam sole", "Pull-tab heel"],
    images: [
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=1000&q=80",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&q=80"
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
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 6800,
    description:
      "Heavyweight wool-blend body with faux-leather sleeves. Cut oversized for the layered look, lined for Nairobi's cold mornings.",
    details: ["Wool-blend body", "Faux-leather sleeves", "Ribbed cuffs and hem", "Quilted lining"],
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&q=80"
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
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 2200,
    description:
      "220gsm heavyweight cotton with a boxy drop-shoulder fit and a puff-print front graphic. Doesn't lose shape after wash.",
    details: ["220gsm cotton", "Drop-shoulder fit", "Puff-print graphic"],
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1000&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80"
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
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 3600,
    description:
      "Ripstop cargo pants with six pockets and an adjustable waist. Tapered leg so they sit right over your kicks.",
    details: ["Ripstop cotton", "Six-pocket cargo build", "Adjustable waistband", "Tapered leg"],
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&q=80",
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1000&q=80"
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
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 3200,
    compareAtPrice: 3900,
    description:
      "400gsm brushed fleece, kangaroo pocket, ribbed hem. The one you reach for every single evening.",
    details: ["400gsm brushed fleece", "Kangaroo pocket", "Ribbed cuffs and hem"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000&q=80",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=1000&q=80"
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
    brand: "IQFITS-47 Label",
    category: "accessories",
    price: 1500,
    description: "6-panel structured cap with an embroidered front logo and adjustable strap back.",
    details: ["Cotton twill", "Embroidered logo", "Adjustable strap"],
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1000&q=80"
    ],
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
    brand: "IQFITS-47 Label",
    category: "accessories",
    price: 1800,
    description: "Heavy canvas tote built to carry a fresh box of kicks without stretching out.",
    details: ["16oz canvas", "Reinforced base", "Interior pocket"],
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&q=80"
    ],
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
    price: 5900,
    compareAtPrice: 7800,
    description:
      "Electric cobalt overlays on a stone-grey knit base. Boost-style midsole for the days you're on your feet from Section 9 to the CBD and back.",
    details: ["Primeknit-style upper", "Boost-style midsole", "Torsion support"],
    images: [
      "https://images.unsplash.com/photo-1597248881519-db089d3744a4?w=1000&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80"
    ],
    colorway: "Cobalt / Stone",
    sizes: sizesRun([2, 3, 5, 6, 5, 3, 1]),
    tags: ["knit", "running"],
    rating: 4.7,
    reviewCount: 69,
  },

  // ── SNEAKERS DROP 015 ────────────────────────────────────────────────────────

  {
    id: "p008",
    slug: "jordan-1-high-chicago",
    name: "Air Jordan 1 High OG",
    brand: "Jordan Brand",
    category: "sneakers",
    price: 9500,
    compareAtPrice: 12000,
    description:
      "The shoe that started everything. The Chicago colorway is the most recognised pair in sneaker history — red, white and black leather that still turns heads from Karen to Kasarani.",
    details: [
      "Full-grain leather upper",
      "Nike Air heel cushioning",
      "Pivot-point rubber outsole",
      "Wings logo at ankle collar",
      "Comes with original box and extra laces",
    ],
    images: [
      "https://images.unsplash.com/photo-1584735175315-9d5df23be388?w=1000&q=80",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&q=80"
    ],
    colorway: "Chicago Red / Black / White",
    sizes: sizesRun([1, 2, 3, 4, 3, 2, 1]),
    tags: ["high-top", "leather", "og", "jordan", "retro"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 5.0,
    reviewCount: 318,
  },
  {
    id: "p009",
    slug: "jordan-4-retro-bred",
    name: "Air Jordan 4 Retro",
    brand: "Jordan Brand",
    category: "sneakers",
    price: 9800,
    compareAtPrice: 12500,
    description:
      "The 4 in Bred colourway — the same pair MJ wore when he hit the shot over Bryon Russell in '98. Visible Air unit, mesh side panels and the iconic plastic lace lock.",
    details: [
      "Nubuck and leather upper",
      "Visible Air heel unit",
      "Mesh side panels for breathability",
      "Plastic lace lock and wings",
      "Herringbone rubber outsole",
    ],
    images: [
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1000&q=80",
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=1000&q=80"
    ],
    colorway: "Bred — Black / Cement Grey / Fire Red",
    sizes: sizesRun([1, 2, 3, 4, 3, 2, 1]),
    tags: ["high-top", "leather", "og", "jordan", "retro"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.9,
    reviewCount: 241,
  },
  {
    id: "p010",
    slug: "nike-dunk-low-panda",
    name: "Nike Dunk Low",
    brand: "Nike",
    category: "sneakers",
    price: 7500,
    compareAtPrice: 9500,
    description:
      "The Panda Dunk — black and white leather in the most dialled-back colourway that matches literally everything. The go-to rotation shoe in Nairobi right now.",
    details: [
      "Leather upper with padded collar",
      "Foam midsole",
      "Rubber outsole with pivot circle",
      "Perforated toe box",
      "Comes with original Nike box",
    ],
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80"
    ],
    colorway: "Panda — White / Black",
    sizes: sizesRun([2, 4, 5, 6, 5, 3, 2]),
    tags: ["low-top", "leather", "dunk", "retro"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.9,
    reviewCount: 407,
  },
  {
    id: "p011",
    slug: "yeezy-350-v2-zebra",
    name: "Yeezy 350 V2",
    brand: "Adidas Yeezy",
    category: "sneakers",
    price: 8800,
    compareAtPrice: 11000,
    description:
      "Zebra — the most re-stocked 350 V2 ever, and still the most wanted. Primeknit sock construction, full-length Boost sole and the signature semi-translucent stripe.",
    details: [
      "Primeknit sock-fit upper",
      "Full-length Boost midsole",
      "Translucent side stripe",
      "No-sew heel tab",
      "Gum rubber outsole",
    ],
    images: [
      "https://images.unsplash.com/photo-1586525198428-225f6f12cff5?w=1000&q=80",
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1000&q=80"
    ],
    colorway: "Zebra — White / Core Black / Red",
    sizes: sizesRun([1, 2, 4, 5, 4, 3, 1]),
    tags: ["low-top", "knit", "yeezy", "boost"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.8,
    reviewCount: 293,
  },
  {
    id: "p012",
    slug: "new-balance-550-white-green",
    name: "New Balance 550",
    brand: "New Balance",
    category: "sneakers",
    price: 6800,
    compareAtPrice: 8500,
    description:
      "The 550 went from a forgotten 80s basketball shoe to the most copied silhouette of the decade. Clean leather upper, flat sole, no gimmicks — just the right shape.",
    details: [
      "Full-grain leather upper",
      "Flat EVA midsole",
      "Perforated toe box",
      "Padded ankle collar",
      "NB logo at heel",
    ],
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80"
    ],
    colorway: "White / Green",
    sizes: sizesRun([2, 3, 5, 6, 5, 4, 2]),
    tags: ["low-top", "leather", "basketball", "retro"],
    rating: 4.8,
    reviewCount: 174,
  },
  {
    id: "p013",
    slug: "jordan-11-retro-jubilee",
    name: "Air Jordan 11 Retro",
    brand: "Jordan Brand",
    category: "sneakers",
    price: 9900,
    compareAtPrice: 13000,
    description:
      "The patent leather 11 in Jubilee colourway — 25th anniversary of the most cinematic sneaker ever worn on a basketball court. Black carbon-fibre shank, full-length Air.",
    details: [
      "Patent leather mudguard",
      "Ballistic mesh upper",
      "Carbon fibre spring plate",
      "Full-length Air-Sole unit",
      "Icy translucent outsole",
    ],
    images: [
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1000&q=80",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1000&q=80"
    ],
    colorway: "Jubilee — Black / White / Silver",
    sizes: sizesRun([1, 2, 3, 4, 3, 2, 1]),
    tags: ["high-top", "patent-leather", "jordan", "retro", "og"],
    rating: 5.0,
    reviewCount: 186,
  },

  // ── MERCH / ACCESSORIES ──────────────────────────────────────────────────────

  {
    id: "j005",
    slug: "iqfits47-varsity-tee-hazard",
    name: "IQFITS-47 Varsity Tee",
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 2500,
    compareAtPrice: 3000,
    description:
      "280gsm ring-spun cotton, acid-washed to a faded vintage finish. Big puff-print IQFITS-47 chest logo, dropped shoulders, boxy hem. Looks broken-in from day one.",
    details: [
      "280gsm ring-spun cotton",
      "Acid-wash vintage finish",
      "Puff-print chest graphic",
      "Boxy drop-shoulder cut",
      "Pre-shrunk — size down if between sizes",
    ],
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1000&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80"
    ],
    colorway: "Hazard Orange / Washed",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 14 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 6 },
    ],
    tags: ["tee", "graphic", "oversized", "vintage"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.8,
    reviewCount: 63,
  },
  {
    id: "j006",
    slug: "track-pants-ink-lime",
    name: "Track Pants",
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 3400,
    compareAtPrice: 4200,
    description:
      "Slim-tapered track pants in ink with lime contrast side-stripe. Elastic waist with drawcord, zip ankle — sits perfectly over any low-top in the catalogue.",
    details: [
      "Poly-cotton blend",
      "Elastic waist with drawcord",
      "Zip ankle cuffs",
      "Side-stripe contrast tape",
      "Side zip pockets",
    ],
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&q=80",
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1000&q=80"
    ],
    colorway: "Ink Black / Lime",
    sizes: [
      { size: "S", stock: 6 },
      { size: "M", stock: 10 },
      { size: "L", stock: 9 },
      { size: "XL", stock: 4 },
    ],
    tags: ["pants", "track", "streetwear"],
    rating: 4.7,
    reviewCount: 48,
  },
  {
    id: "a003",
    slug: "crew-socks-3pack-hazard",
    name: "Crew Socks 3-Pack",
    brand: "IQFITS-47 Label",
    category: "accessories",
    price: 900,
    description:
      "Three pairs of mid-crew socks — one plain white, one hazard orange with ink tipping, one black with lime IQFITS-47 knit-in text. The finishing touch on any fit.",
    details: [
      "75% combed cotton, 20% nylon, 5% elastane",
      "Reinforced heel and toe",
      "Mid-crew height",
      "Set of 3 pairs",
    ],
    images: [
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=1000&q=80",
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=1000&q=80"
    ],
    colorway: "White / Hazard / Black",
    sizes: [{ size: "One Size", stock: 40 }],
    tags: ["socks", "accessories", "3-pack"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: "a004",
    slug: "mini-crossbody-bag-ink",
    name: "Mini Crossbody Bag",
    brand: "IQFITS-47 Label",
    category: "accessories",
    price: 3200,
    compareAtPrice: 3800,
    description:
      "Pebbled faux-leather crossbody with a debossed IQFITS-47 logo flap and adjustable webbing strap. Fits your phone, cards, keys and earbuds — everything you need when you're not on a laptop day.",
    details: [
      "Pebbled faux-leather exterior",
      "Debossed logo flap closure",
      "Adjustable nylon strap (max 140cm)",
      "Interior zip pocket + card slots",
      "Zipper main compartment",
    ],
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1000&q=80"
    ],
    colorway: "Ink Black",
    sizes: [{ size: "One Size", stock: 18 }],
    tags: ["bag", "crossbody", "accessories"],
    rating: 4.6,
    reviewCount: 37,
  },

  // ── SNEAKERS ADDITIONS ──────────────────────────────────────────────────────

  {
    id: "p014",
    slug: "air-force-1-07-white",
    name: "Air Force 1 '07",
    brand: "Nike",
    category: "sneakers",
    price: 6800,
    compareAtPrice: 8500,
    description:
      "The classic triple-white Air Force 1. Clean leather, padded collar, and iconic metal dubrae. The definitive lifestyle sneaker for styling anything from cargos to jeans.",
    details: [
      "Crisp leather upper",
      "Nike Air cushioning",
      "Low-cut padded collar",
      "Non-marking rubber outsole",
    ],
    images: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80"
    ],
    colorway: "Triple White",
    sizes: sizesRun([2, 5, 8, 10, 8, 4, 2]),
    tags: ["low-top", "leather", "classic"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.9,
    reviewCount: 340,
  },
  {
    id: "p015",
    slug: "yeezy-boost-350-v2-beluga",
    name: "Yeezy Boost 350 V2 Beluga",
    brand: "Adidas Yeezy",
    category: "sneakers",
    price: 8900,
    compareAtPrice: 11500,
    description:
      "The Beluga Reflective brings back the iconic gray-and-orange pattern. Fitted with 3M reflective threads woven into the Primeknit upper and signature boost cushioning.",
    details: [
      "Reflective Primeknit upper",
      "Full-length Boost midsole",
      "Solar Red stripe with SPLY-350 branding",
      "Translucent rubber outsole",
    ],
    images: [
      "https://images.unsplash.com/photo-1586525198428-225f6f12cff5?w=1000&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80"
    ],
    colorway: "Beluga Reflective",
    sizes: sizesRun([1, 3, 5, 7, 5, 3, 1]),
    tags: ["low-top", "knit", "reflective", "yeezy"],
    rating: 4.8,
    reviewCount: 195,
  },
  {
    id: "p016",
    slug: "new-balance-2002r-protection-pack-grey",
    name: "New Balance 2002R Protection Pack",
    brand: "New Balance",
    category: "sneakers",
    price: 8800,
    compareAtPrice: 10500,
    description:
      "A premium runner featuring rough-cut suede overlays and mesh panels. N-ergy shock absorption provides uncompromised all-day support.",
    details: [
      "Deconstructed hairy suede overlays",
      "N-ergy shock absorbing outsole",
      "ABZORB SBS heel cushioning",
      "Mesh underlays",
    ],
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80",
      "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=1000&q=80"
    ],
    colorway: "Rain Cloud Grey",
    sizes: sizesRun([2, 4, 6, 7, 5, 3, 1]),
    tags: ["runner", "suede", "deconstructed"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.9,
    reviewCount: 112,
  },
  {
    id: "p017",
    slug: "jordan-4-retro-military-black",
    name: "Air Jordan 4 Military Black",
    brand: "Jordan Brand",
    category: "sneakers",
    price: 9900,
    compareAtPrice: 12500,
    description:
      "One of the cleanest colour-blocks on the Jordan 4 silhouette. Standard smooth white leather overlays paired with light grey suede accents and military black tooling.",
    details: [
      "Smooth white leather panels",
      "Neutral grey suede toe guard",
      "Air Max window cushioning",
      "Embossed Jumpman logo on heel tab",
    ],
    images: [
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=1000&q=80",
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1000&q=80"
    ],
    colorway: "White / Military Black / Neutral Grey",
    sizes: sizesRun([1, 3, 5, 6, 5, 3, 2]),
    tags: ["high-top", "leather", "retro", "jordan"],
    rating: 4.9,
    reviewCount: 228,
  },

  // ── STREETWEAR / APPAREL ADDITIONS ──────────────────────────────────────────

  {
    id: "j007",
    slug: "boxy-zip-hoodie-ink",
    name: "Boxy Zip Hoodie",
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 3600,
    compareAtPrice: 4500,
    description:
      "420gsm loopback cotton zip hoodie. Double-lined hood with no drawcords for a clean drape, featuring a heavy two-way matte black metal zipper.",
    details: [
      "420gsm heavy loopback cotton",
      "Two-way YKK metal zipper",
      "Boxy cropped body with wide sleeves",
      "Ribbed side panels",
    ],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000&q=80",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=1000&q=80"
    ],
    colorway: "Ink Black",
    sizes: [
      { size: "S", stock: 8 },
      { size: "M", stock: 12 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 5 },
    ],
    tags: ["hoodie", "outerwear", "zip-up"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.8,
    reviewCount: 54,
  },
  {
    id: "j008",
    slug: "nylon-cargo-shorts-olive",
    name: "Nylon Cargo Shorts",
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 2600,
    compareAtPrice: 3200,
    description:
      "Waterproof crinkle nylon shorts featuring an integrated webbing belt and 3D cargo side compartments. Perfect matching piece for low-top runners.",
    details: [
      "100% waterproof crinkle nylon",
      "Integrated webbing belt with quick-release buckle",
      "Bellows cargo pockets with snap closure",
      "Relaxed wide-leg opening",
    ],
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&q=80",
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1000&q=80"
    ],
    colorway: "Olive Drab",
    sizes: [
      { size: "S", stock: 5 },
      { size: "M", stock: 9 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 4 },
    ],
    tags: ["shorts", "utility", "nylon"],
    rating: 4.7,
    reviewCount: 29,
  },
  {
    id: "j009",
    slug: "heavyweight-waffle-knit-longsleeve-cream",
    name: "Waffle Knit Longsleeve",
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 2800,
    compareAtPrice: 3500,
    description:
      "320gsm thermal waffle knit cotton. Cut wide through the chest with fitted cuffs, making it the ideal base layer under our varsity jacket.",
    details: [
      "320gsm thermal waffle fabric",
      "Flatlock comfort seams",
      "Thick ribbed cuffs and crew collar",
      "Pre-shrunk cotton fabric",
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1000&q=80"
    ],
    colorway: "Cream White",
    sizes: [
      { size: "S", stock: 6 },
      { size: "M", stock: 10 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 3 },
    ],
    tags: ["longsleeve", "waffle", "thermal"],
    rating: 4.6,
    reviewCount: 42,
  },
  {
    id: "j010",
    slug: "utility-vest-slate",
    name: "Utility Vest",
    brand: "IQFITS-47 Label",
    category: "apparel",
    price: 3500,
    compareAtPrice: 4200,
    description:
      "Tech utility vest in slate grey ripstop with modular webbing loops, zipped chest compartments, and a breathable mesh backing.",
    details: [
      "Tear-resistant polyester ripstop",
      "Breathable mesh back paneling",
      "D-ring attachment hardware",
      "Zipped utility storage pockets",
    ],
    images: [
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1000&q=80",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&q=80"
    ],
    colorway: "Slate Grey",
    sizes: [
      { size: "S", stock: 4 },
      { size: "M", stock: 7 },
      { size: "L", stock: 6 },
      { size: "XL", stock: 2 },
    ],
    tags: ["vest", "outerwear", "tactical"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.7,
    reviewCount: 19,
  },

  // ── ACCESSORIES ADDITIONS ──────────────────────────────────────────────────

  {
    id: "a005",
    slug: "trucker-cap-ink-white",
    name: "Two-Tone Trucker Cap",
    brand: "IQFITS-47 Label",
    category: "accessories",
    price: 1600,
    compareAtPrice: 2000,
    description:
      "Two-tone structured trucker cap with foam front paneling, mesh backing, and snapback adjustment. Finished with high-density brand print.",
    details: [
      "Structured polyester foam front panel",
      "Breathable mesh side and rear panels",
      "Adjustable plastic snapback enclosure",
    ],
    images: [
      "https://images.unsplash.com/photo-1534215754734-18e55d13ce35?w=1000&q=80"
    ],
    colorway: "Ink Black / Off-White",
    sizes: [{ size: "One Size", stock: 25 }],
    tags: ["trucker", "cap", "headwear"],
    rating: 4.8,
    reviewCount: 30,
  },
  {
    id: "a006",
    slug: "duffle-bag-ink",
    name: "Weekend Duffle Bag",
    brand: "IQFITS-47 Label",
    category: "accessories",
    price: 4800,
    compareAtPrice: 5800,
    description:
      "Heavyweight 1200D water-repellent nylon duffle bag with a separate shoe compartment to keep your clean kicks isolated from clothes.",
    details: [
      "1200D water-repellent ballistic nylon",
      "Isolated side-access shoe pocket with vents",
      "Detachable padded shoulder strap",
      "Heavy-duty double lockable zippers",
    ],
    images: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=1000&q=80"
    ],
    colorway: "Ink Black",
    sizes: [{ size: "One Size", stock: 12 }],
    tags: ["bag", "duffle", "travel"],
    isNewDrop: true,
    dropNumber: "DROP 015",
    rating: 4.9,
    reviewCount: 22,
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
