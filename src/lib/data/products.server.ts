import "server-only";

import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, publicSupabaseConfig } from "@/lib/env";
import {
  VERIFIED_PRODUCTS,
  type Product,
  type ProductConcern,
  type ProductVariant,
  type SkinType,
} from "@/lib/data/products";

type SupabaseVariantRow = {
  id: string;
  sku: string;
  name: string;
  size?: string | null;
  price_minor: number;
  compare_at_price_minor?: number | null;
  stock?: number | null;
  status: string;
};

type SupabaseProductRow = {
  id: string;
  slug: string;
  name: string;
  category?: string | null;
  concerns?: string[] | null;
  skin_types?: string[] | null;
  image_url?: string | null;
  badge?: "new" | "bestseller" | "limited" | null;
  stock_status?: "in-stock" | "low" | "out-of-stock" | null;
  description?: string | null;
  benefits?: string[] | null;
  key_ingredients?: string[] | null;
  how_to_use?: string[] | null;
  warnings?: string | null;
  delivery?: string | null;
  is_fixture?: boolean | null;
  product_variants?: SupabaseVariantRow[] | null;
};

type CatalogueCache = {
  products: Product[];
  expiresAt: number;
  inFlight?: Promise<Product[]>;
};

const globalForCatalogue = globalThis as unknown as {
  __fynnestladyCatalogueCache?: CatalogueCache;
};

const CATALOGUE_CACHE_TTL_MS = 60_000;

function mapSupabaseRowToProduct(row: SupabaseProductRow): Product {
  const variants: ProductVariant[] = (row.product_variants ?? []).map((v) => ({
    id: v.id,
    sku: v.sku,
    name: v.name,
    size: v.size ?? "Standard",
    price: Number(v.price_minor ?? 0),
    compareAtPrice:
      v.compare_at_price_minor != null
        ? Number(v.compare_at_price_minor)
        : undefined,
    stock: Number(v.stock ?? 0),
  }));
  const defaultVariant = variants[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category || "Skincare",
    concerns: (row.concerns as ProductConcern[]) ?? ["everyday"],
    skinTypes: (row.skin_types as SkinType[]) ?? ["all"],
    price: defaultVariant?.price ?? 0,
    compareAtPrice: defaultVariant?.compareAtPrice,
    image: row.image_url || "/images/products/product-1.jpeg",
    badge: row.badge ?? undefined,
    stockStatus: row.stock_status ?? "in-stock",
    description: row.description || "",
    benefits: row.benefits ?? [],
    keyIngredients: row.key_ingredients ?? [],
    howToUse: row.how_to_use ?? [],
    warnings: row.warnings || "For external use only.",
    delivery:
      row.delivery || "Available for nationwide delivery across Ghana.",
    variants,
    fixture: row.is_fixture ?? false,
  };
}

/**
 * Server-only catalogue reader with `globalThis` caching across Next.js RSC route bundles.
 */
export async function fetchAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return VERIFIED_PRODUCTS;
  }

  const now = Date.now();
  const cached = globalForCatalogue.__fynnestladyCatalogueCache;
  if (cached && cached.expiresAt > now) {
    return cached.products;
  }
  if (cached?.inFlight) {
    return cached.inFlight;
  }

  const requestPromise = (async (): Promise<Product[]> => {
    try {
      const { url, publishableKey } = publicSupabaseConfig();
      const supabase = createClient(url, publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, slug, name, category, concerns, skin_types, image_url, badge, stock_status, description, benefits, key_ingredients, how_to_use, warnings, delivery, is_fixture, product_variants(id, sku, name, size, price_minor, compare_at_price_minor, stock, status)"
        )
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .abortSignal(AbortSignal.timeout(2500));

      const result =
        !error && data && data.length > 0
          ? (data as SupabaseProductRow[]).map(mapSupabaseRowToProduct)
          : VERIFIED_PRODUCTS;

      globalForCatalogue.__fynnestladyCatalogueCache = {
        products: result,
        expiresAt: Date.now() + CATALOGUE_CACHE_TTL_MS,
      };
      return result;
    } catch {
      globalForCatalogue.__fynnestladyCatalogueCache = {
        products: VERIFIED_PRODUCTS,
        expiresAt: Date.now() + CATALOGUE_CACHE_TTL_MS,
      };
      return VERIFIED_PRODUCTS;
    }
  })();

  globalForCatalogue.__fynnestladyCatalogueCache = {
    products: cached?.products ?? VERIFIED_PRODUCTS,
    expiresAt: 0,
    inFlight: requestPromise,
  };

  return requestPromise;
}

export async function fetchProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const all = await fetchAllProducts();
  return all.find((p) => p.slug === slug);
}

