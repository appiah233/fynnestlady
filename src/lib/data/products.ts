/**
 * FYNNESTLADY SKINCARE — OFFICIAL CATALOGUE DATA (CLIENT & SERVER SAFE)
 *
 * Pure TypeScript module with zero SDK imports so client components can import
 * product types, concern labels, and catalogue items without pulling server/DB
 * SDKs into the browser bundle. Server-side Supabase fetching lives in
 * `src/lib/data/products.server.ts`.
 */

export type SkinType = "dry" | "oily" | "combination" | "sensitive" | "all";

export type ProductConcern =
  | "acne-breakouts"
  | "dark-spots"
  | "uneven-tone"
  | "blemishes"
  | "radiance"
  | "everyday";

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  size: string;
  price: number; // minor units (pesewas)
  compareAtPrice?: number; // minor units (pesewas)
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  category: string;
  concerns: ProductConcern[];
  skinTypes: SkinType[];
  price: number; // minor units (default variant)
  compareAtPrice?: number;
  image: string;
  badge?: "new" | "bestseller" | "limited";
  stockStatus: "in-stock" | "low" | "out-of-stock";
  description: string;
  benefits: string[];
  keyIngredients: string[];
  howToUse: string[];
  warnings: string | string[];
  delivery: string;
  variants: ProductVariant[];
  fixture: boolean;
}

export const CONCERN_LABELS: Record<ProductConcern, string> = {
  "acne-breakouts": "Acne & Breakouts",
  "dark-spots": "Dark Spots",
  "uneven-tone": "Uneven Skin Tone",
  blemishes: "Blemishes",
  radiance: "Complexion & Radiance",
  everyday: "Everyday Care",
};

export const VERIFIED_PRODUCTS: Product[] = [
  {
    id: "prod-eden-bliss-deluxe-soap",
    slug: "eden-bliss-deluxe-soap",
    name: "Eden Bliss Deluxe Soap",
    subtitle: "Handmade Herbal Soap Blend | 500 ml",
    category: "Body Care",
    concerns: ["uneven-tone", "dark-spots", "radiance"],
    skinTypes: ["all"],
    price: 40000, // GH₵400
    image: "/images/products/product-1.jpeg",
    badge: "bestseller",
    stockStatus: "in-stock",
    description:
      "Experience a unique blend of herbal-inspired skincare ingredients with Eden Bliss Deluxe Soap. Formulated with kojic acid, licorice, honey, rose water, carrot extract, sandalwood powder, and vitamins, this blend is designed for complexion-focused body care. Your skin deserves the Fynnest care.",
    benefits: [
      "Helps improve the appearance of uneven skin tone.",
      "Targets the appearance of body spots.",
      "Supports smoother-looking skin.",
    ],
    keyIngredients: [
      "Kojic acid",
      "Licorice",
      "Honey",
      "Rose water",
      "Carrot extract",
      "Sandalwood powder",
      "Vitamins",
    ],
    howToUse: [
      "Lather a small amount onto damp skin during your bath or shower.",
      "Massage gently across the body, focusing on areas of uneven tone.",
      "Rinse thoroughly with warm water and follow with a nourishing moisturiser.",
    ],
    warnings:
      "For external use only. Avoid direct contact with eyes. Perform a patch test before first use and use daily sun protection.",
    delivery: "Available for nationwide delivery across Ghana.",
    variants: [
      {
        id: "var-eden-bliss-500ml",
        sku: "FL-EBS-500",
        name: "Eden Bliss Deluxe Soap — 500 ml",
        size: "500 ml",
        price: 40000,
        stock: 25,
      },
    ],
    fixture: false,
  },
  {
    id: "prod-blosom-face-lightening-milk",
    slug: "blosom-face-lightening-milk",
    name: "Blosom Face Lightening Milk",
    subtitle: "Anti-Ageing | Skin Firming | Dark Spot Care",
    category: "Moisturisers",
    concerns: ["dark-spots", "uneven-tone", "radiance"],
    skinTypes: ["all", "dry", "combination"],
    price: 28000, // GH₵280 (50 ml default)
    image: "/images/products/product-2.jpeg",
    badge: "bestseller",
    stockStatus: "in-stock",
    description:
      "Give your skincare routine a boost with Blosom Face Lightening Milk, formulated with Vitamin E and grapeseed oil to complement your facial skincare routine. Your glow deserves specialised care.",
    benefits: [
      "Helps improve the appearance of dark spots and uneven skin tone.",
      "Supports smoother, firmer-looking skin.",
      "Helps nourish the skin and improve its appearance.",
      "Designed for complexion care and mature-looking skin.",
    ],
    keyIngredients: ["Vitamin E", "Grapeseed oil"],
    howToUse: [
      "Apply a small amount to clean, dry facial skin.",
      "Gently massage until fully absorbed.",
      "Use consistently and pair with broad-spectrum sunscreen during the day.",
    ],
    warnings:
      "For external use only. Patch test before first use. Discontinue use if irritation occurs.",
    delivery: "Available for nationwide delivery across Ghana.",
    variants: [
      {
        id: "var-blosom-milk-50ml",
        sku: "FL-BLM-50",
        name: "Blosom Face Lightening Milk — 50 ml",
        size: "50 ml",
        price: 28000, // GH₵280
        stock: 20,
      },
      {
        id: "var-blosom-milk-100ml",
        sku: "FL-BLM-100",
        name: "Blosom Face Lightening Milk — 100 ml",
        size: "100 ml",
        price: 32000, // GH₵320
        stock: 20,
      },
    ],
    fixture: false,
  },
  {
    id: "prod-glitzer-face-scrub",
    slug: "glitzer-face-scrub",
    name: "Glitzer Face Scrub",
    subtitle: "Nourish • Cleanse • Exfoliate",
    category: "Cleansers",
    concerns: ["radiance", "uneven-tone", "everyday"],
    skinTypes: ["all", "oily", "combination", "dry"],
    price: 30000, // GH₵300
    image: "/images/products/product-3.jpeg",
    badge: "new",
    stockStatus: "in-stock",
    description:
      "Reveal a fresher-looking glow with Glitzer Face Scrub. Formulated with oats and essential oils, this exfoliating scrub helps remove surface impurities and dead skin cells, leaving your skin feeling smoother, softer, and refreshed. Reveal your glow. Experience the Fynnest Effect.",
    benefits: [
      "Gently exfoliates the skin.",
      "Helps improve the appearance of dull skin.",
      "Leaves skin feeling soft, smooth, and refreshed.",
    ],
    keyIngredients: ["Oats", "Essential oils"],
    howToUse: [
      "Apply to damp facial skin and massage gently in circular motions.",
      "Avoid the delicate eye area.",
      "Rinse thoroughly with lukewarm water and follow with toner and moisturiser.",
    ],
    warnings:
      "For external use only. Do not use on broken or irritated skin.",
    delivery: "Available for nationwide delivery across Ghana.",
    variants: [
      {
        id: "var-glitzer-scrub-200ml",
        sku: "FL-GFS-200",
        name: "Glitzer Face Scrub — 200 ml",
        size: "200 ml",
        price: 30000,
        stock: 20,
      },
    ],
    fixture: false,
  },
  {
    id: "prod-nova-gold-face-cream",
    slug: "nova-gold-face-cream",
    name: "Nova Gold Face Cream",
    subtitle: "Pure & Elegant Beauty",
    category: "Moisturisers",
    concerns: ["uneven-tone", "dark-spots", "radiance"],
    skinTypes: ["all", "dry", "combination"],
    price: 28000, // GH₵280
    image: "/images/products/product-4.jpeg",
    badge: "new",
    stockStatus: "in-stock",
    description:
      "Pure & Elegant Beauty. Helps improve the appearance of fine lines, sun damage, and uneven skin tone for a smoother, more radiant-looking complexion. Reveal Your Radiance. Experience the Fynnest Effect.",
    benefits: [
      "Helps improve the appearance of fine lines.",
      "Targets the appearance of sun damage and uneven skin tone.",
      "Supports a smoother, more radiant-looking complexion.",
    ],
    keyIngredients: ["Complexion-nourishing botanicals & emollients"],
    howToUse: [
      "Apply evenly to a cleansed face and neck.",
      "Massage gently in upward strokes until absorbed.",
      "Use daily sunscreen during daytime routines.",
    ],
    warnings:
      "For external use only. Avoid contact with eyes. Store in a cool, dry place.",
    delivery: "Available for nationwide delivery across Ghana.",
    variants: [
      {
        id: "var-nova-gold-50g",
        sku: "FL-NGC-50G",
        name: "Nova Gold Face Cream — 50 g",
        size: "50 g",
        price: 28000,
        stock: 20,
      },
    ],
    fixture: false,
  },
  {
    id: "prod-revive-essence-toner",
    slug: "revive-essence-toner",
    name: "Revive Essence Toner",
    subtitle: "Refresh • Soothe • Clarify",
    category: "Treatments",
    concerns: ["acne-breakouts", "blemishes", "everyday"],
    skinTypes: ["oily", "combination", "sensitive", "all"],
    price: 25000, // GH₵250
    image: "/images/products/product-5.jpeg",
    badge: undefined,
    stockStatus: "in-stock",
    description:
      "Refresh • Soothe • Clarify. Formulated with witch hazel and carrot herbs to refresh the skin and support a clearer-looking complexion.",
    benefits: [
      "Helps remove excess surface oil and refresh the skin.",
      "Designed for mild blemish-prone skin.",
      "Helps soothe the feeling of skin discomfort.",
    ],
    keyIngredients: ["Witch hazel", "Carrot herbs"],
    howToUse: [
      "After cleansing, apply to a cotton pad or directly into clean palms.",
      "Gently sweep or pat across the face and neck, avoiding the eyes.",
      "Follow with your Fynnestlady treatment or moisturiser.",
    ],
    warnings:
      "For external use only. Avoid direct contact with eyes.",
    delivery: "Available for nationwide delivery across Ghana.",
    variants: [
      {
        id: "var-revive-toner-100ml",
        sku: "FL-RET-100",
        name: "Revive Essence Toner — 100 ml",
        size: "100 ml",
        price: 25000,
        stock: 25,
      },
    ],
    fixture: false,
  },
  {
    id: "prod-fruity-pebbles-exfoliating-scrub",
    slug: "fruity-pebbles-exfoliating-scrub",
    name: "Fruity Pebbles Exfoliating Scrub",
    subtitle: "Deep Exfoliation • Complexion Care",
    category: "Body Care",
    concerns: ["uneven-tone", "dark-spots", "radiance"],
    skinTypes: ["all"],
    price: 20000, // GH₵200
    image: "/images/products/product-6.jpeg",
    badge: "bestseller",
    stockStatus: "in-stock",
    description:
      "Deep Exfoliation • Complexion Care. Designed to deeply exfoliate the skin and improve the appearance of pigmentation and discolouration, leaving your skin feeling smoother and refreshed.",
    benefits: [
      "Helps remove dead skin cells.",
      "Targets the appearance of uneven skin tone.",
      "Supports smoother, brighter-looking skin.",
    ],
    keyIngredients: ["Botanical fruit & therapeutic exfoliating blend"],
    howToUse: [
      "After shower, wash lather off skin, then scoop a desirable quantity in your hands.",
      "Gently scrub your body, concentrating on darker areas, inner thigh, pigment, knuckles, feet, and hands for a few minutes, then rinse with water.",
      "Tap dry, then moisturise right after.",
    ],
    warnings:
      "For external use only. Keep in a cool, dry place. Avoid direct sunlight.",
    delivery: "Available for nationwide delivery across Ghana.",
    variants: [
      {
        id: "var-fruity-pebbles-250g",
        sku: "FL-FPS-250G",
        name: "Fruity Pebbles Exfoliating Scrub — 250 g",
        size: "250 g",
        price: 20000,
        stock: 30,
      },
    ],
    fixture: false,
  },
];

export const FIXTURE_PRODUCTS: Product[] = VERIFIED_PRODUCTS;

export function getProductBySlug(slug: string): Product | undefined {
  return VERIFIED_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByConcern(concern: ProductConcern): Product[] {
  return VERIFIED_PRODUCTS.filter((p) => p.concerns.includes(concern));
}

export function getAllProducts(): Product[] {
  return VERIFIED_PRODUCTS;
}
