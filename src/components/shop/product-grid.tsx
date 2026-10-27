"use client";

import { ProductCard } from "@/components/ui/product-card";
import type { Product } from "@/lib/data/products";
import { EmptyState } from "@/components/ui/status";

export function ProductGrid({
  products,
  loading,
}: {
  products: readonly Product[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div
        className="ui-product-grid"
        aria-busy="true"
        aria-label="Loading products"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No matching skincare products found"
        className="max-w-[34rem] mx-auto"
      >
        <p className="text-body text-ink-muted m-0">
          Try clearing one or more filters, or explore our concern guides while
          verified catalogue items are being prepared.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="ui-product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <article
      className="ui-card--raised shadow-sm flex flex-col h-full"
      aria-hidden="true"
    >
      <div className="aspect-[4/5] bg-surface-muted ui-overflow-clip">
        <div className="h-full w-full ui-skeleton" />
      </div>
      <div className="ui-card__body space-y-3">
        <div className="h-3 w-24 ui-skeleton" />
        <div className="h-6 w-44 ui-skeleton" />
        <div className="h-4 w-32 ui-skeleton" />
        <div className="pt-2 flex items-baseline justify-between gap-2">
          <div className="h-5 w-20 ui-skeleton" />
          <div className="h-4 w-14 ui-skeleton" />
        </div>
      </div>
    </article>
  );
}
