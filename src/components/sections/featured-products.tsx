import Link from "next/link";
import { ProductCard } from "@/components/ui/product-card";
import { fetchAllProducts } from "@/lib/data/products.server";

export async function FeaturedProducts() {
  const products = await fetchAllProducts();

  return (
    <section id="catalogue" className="border-b border-hairline bg-background">
      <div className="container-page py-20 sm:py-24 lg:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-[42rem]">
            <p className="text-utility font-bold uppercase tracking-[0.16em] text-primary m-0">
              Curated Collection
            </p>
            <h2 className="font-display text-heading m-0">
              Fynnestlady Skincare Collection
            </h2>
            <p className="text-body-sm text-ink-muted m-0">
              Explore our complexion-focused facial and body care essentials.
              Your skin deserves the Fynnest care.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-utility font-bold text-primary hover:underline inline-flex items-center gap-1.5 min-h-11"
          >
            View all {products.length} products <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="ui-product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="ui-empty">Product details are being prepared.</p>
        )}
      </div>
    </section>
  );
}
