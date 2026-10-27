"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-grid";
import { MobileFilterDrawer } from "@/components/shop/mobile-filter-drawer";
import {
  CONCERN_LABELS,
  getAllProducts,
  type ProductConcern,
  type SkinType,
} from "@/lib/data/products";

const PAGE_SIZE = 8;

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A to Z",
};

const CONCERN_DESCRIPTIONS: Record<string, string> = {
  "acne-breakouts":
    "Targeted routines and gentle cleansers formulated for blemish-prone and breakout-prone skin.",
  "dark-spots":
    "Tone-evening care designed to help visibly reduce the appearance of hyperpigmentation and dark marks.",
  "uneven-tone":
    "Consistent brightening and barrier-supportive formulas for a balanced, even-looking complexion.",
  blemishes:
    "Clarifying treatments and soothing hydration to support clearer-looking skin without harshness.",
  radiance:
    "Antioxidant and moisture-replenishing care to restore a healthy, luminous Fynnest Glow.",
  everyday:
    "Foundational daily cleansers, moisturisers, and sun protection for resilient skin maintenance.",
  "everyday-care":
    "Foundational daily cleansers, moisturisers, and sun protection for resilient skin maintenance.",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <p className="text-body text-ink-muted" role="status">
            Loading shop collection…
          </p>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const view = searchParams.get("view") === "concern" ? "concern" : "products";
  const concern = searchParams.get("concern") as ProductConcern | null;
  const category = searchParams.get("category") || undefined;
  const skinType = searchParams.get("skinType") as SkinType | null;
  const availability = searchParams.get("availability") || undefined;
  const sort = (searchParams.get("sort") as SortOption) ?? "featured";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

  let products = [...getAllProducts()];

  if (concern) {
    products = products.filter((p) => p.concerns.includes(concern));
  }
  if (category) {
    products = products.filter((p) => p.category === category);
  }
  if (skinType) {
    products = products.filter((p) => p.skinTypes.includes(skinType));
  }
  if (availability === "in-stock") {
    products = products.filter((p) => p.stockStatus === "in-stock");
  } else if (availability === "low") {
    products = products.filter((p) => p.stockStatus === "low");
  } else if (availability === "out-of-stock") {
    products = products.filter((p) => p.stockStatus === "out-of-stock");
  }

  products.sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    return 0;
  });

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages || 1);
  const paged = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterItems: Array<{ key: string; label: string }> = [
    ...(concern
      ? [{ key: "concern", label: CONCERN_LABELS[concern] ?? concern }]
      : []),
    ...(category ? [{ key: "category", label: category }] : []),
    ...(skinType
      ? [
          {
            key: "skinType",
            label: `Skin: ${skinType.charAt(0).toUpperCase() + skinType.slice(1)}`,
          },
        ]
      : []),
    ...(availability
      ? [{ key: "availability", label: `Status: ${availability}` }]
      : []),
  ];

  const activeFilters = activeFilterItems.length;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "view") params.set("page", "1");
    setLoading(true);
    router.replace(`${pathname}?${params.toString()}`);
    setLoading(false);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (view === "concern") params.set("view", "concern");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const setQuery = (key: string, value: string): string => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div>
      <section className="border-b border-hairline bg-surface-raised">
        <div className="container-page py-10 sm:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 max-w-[44rem]">
              <p className="text-utility font-bold uppercase tracking-[0.16em] text-primary m-0">
                Fynnestlady Collection
              </p>
              <h1 className="font-display text-heading m-0">
                {view === "concern"
                  ? "Shop Skincare by Concern"
                  : concern && CONCERN_LABELS[concern]
                  ? CONCERN_LABELS[concern]
                  : "Shop All Skincare"}
              </h1>
              <p className="text-body text-ink-muted m-0">
                {view === "concern"
                  ? "Begin with what your skin needs most. Explore concern-focused collections designed for clarity, comfort, and radiant skin."
                  : "Personalised skincare formulated with 12 years of experience in acne care and complexion improvement."}
              </p>
              <p
                className="text-body-sm text-ink-muted pt-1 m-0"
                role="status"
                aria-live="polite"
              >
                Showing {paged.length} of {products.length} product
                {products.length !== 1 ? "s" : ""}
                {activeFilters > 0
                  ? ` · ${activeFilters} active filter${activeFilters !== 1 ? "s" : ""}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="inline-flex rounded-sm border border-hairline bg-surface-panel p-1"
                role="group"
                aria-label="Shop view mode"
              >
                <button
                  type="button"
                  onClick={() => updateParam("view", "products")}
                  aria-pressed={view === "products"}
                  className={[
                    "min-h-10 px-3.5 py-1.5 rounded-sm text-utility font-bold transition-colors",
                    view === "products"
                      ? "bg-primary text-primary-foreground"
                      : "text-ink hover:bg-surface-muted",
                  ].join(" ")}
                >
                  All Products
                </button>
                <button
                  type="button"
                  onClick={() => updateParam("view", "concern")}
                  aria-pressed={view === "concern"}
                  className={[
                    "min-h-10 px-3.5 py-1.5 rounded-sm text-utility font-bold transition-colors",
                    view === "concern"
                      ? "bg-primary text-primary-foreground"
                      : "text-ink hover:bg-surface-muted",
                  ].join(" ")}
                >
                  By Concern
                </button>
              </div>

              <MobileFilterDrawer />

              <div className="hidden sm:flex items-center gap-2">
                <label
                  htmlFor="shop-sort-select"
                  className="text-caption font-bold text-ink-muted"
                >
                  Sort:
                </label>
                <select
                  id="shop-sort-select"
                  value={sort}
                  onChange={(e) => updateParam("sort", e.target.value)}
                  className="min-h-11 rounded-sm border border-hairline bg-surface-panel px-3 py-2 text-utility font-bold text-ink"
                >
                  {(
                    Object.entries(SORT_LABELS) as Array<[SortOption, string]>
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {activeFilterItems.length > 0 && (
            <div
              className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-hairline"
              aria-label="Active filters"
            >
              {activeFilterItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateParam(item.key, "")}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary-soft border border-primary/30 px-3 py-1 text-caption font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span>{item.label}</span>
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only">Remove {item.label} filter</span>
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-caption font-bold text-ink-muted underline hover:text-primary px-2 py-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="container-page py-12 sm:py-16 lg:py-20">
        {view === "concern" ? (
          <ConcernView
            onSelectConcern={(c) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("concern", c);
              params.set("view", "products");
              params.set("page", "1");
              router.replace(`${pathname}?${params.toString()}`);
            }}
          />
        ) : (
          <ProductGrid products={paged} loading={loading} />
        )}

        {view === "products" && totalPages > 1 && (
          <nav
            aria-label="Shop pagination"
            className="mt-12 flex items-center justify-between gap-4 border-t border-hairline pt-8"
          >
            {currentPage > 1 ? (
              <Link
                href={setQuery("page", String(currentPage - 1))}
                prefetch
                className="ui-button"
                data-variant="secondary"
              >
                &larr; Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-utility text-ink-muted">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={setQuery("page", String(currentPage + 1))}
                prefetch
                className="ui-button"
                data-variant="secondary"
              >
                Next &rarr;
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

function ConcernView({
  onSelectConcern,
}: {
  onSelectConcern: (concern: ProductConcern) => void;
}) {
  const concerns = Object.entries(CONCERN_LABELS) as Array<
    [ProductConcern, string]
  >;

  return (
    <div className="space-y-10">
      <div className="space-y-3 max-w-[44rem]">
        <h2 className="font-display text-subheading m-0">
          Explore by skin concern
        </h2>
        <p className="text-body text-ink-muted m-0">
          Choose a concern to filter relevant skincare formulas. These categories
          are educational discovery starting points, not medical diagnoses.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {concerns.map(([concernKey, label]) => (
          <button
            key={concernKey}
            type="button"
            onClick={() => onSelectConcern(concernKey)}
            className="ui-card--panel shadow-sm p-6 sm:p-8 hover:shadow-md hover:border-primary transition-all duration-200 text-left flex flex-col justify-between gap-4"
          >
            <div className="space-y-2">
              <p className="text-caption font-bold uppercase tracking-wider text-primary m-0">
                Concern Guide
              </p>
              <h3 className="font-display text-subheading m-0">{label}</h3>
              <p className="text-body-sm text-ink-muted leading-relaxed m-0">
                {CONCERN_DESCRIPTIONS[concernKey] ??
                  `Explore products formulated for ${label.toLowerCase()}.`}
              </p>
            </div>
            <span className="text-utility font-bold text-primary inline-flex items-center gap-1 pt-2">
              View formulas <span aria-hidden="true">&rarr;</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
