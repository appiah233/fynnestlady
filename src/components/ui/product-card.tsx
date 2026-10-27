import Image from "next/image";
import Link from "next/link";
import { CONCERN_LABELS, type Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";

const BADGE_LABELS: Record<NonNullable<Product["badge"]>, string> = {
  new: "New Formula",
  bestseller: "Customer Favourite",
  limited: "Limited Batch",
};

export function ProductCard({ product }: { product: Product }) {
  const variant = product.variants?.[0];
  const rawPrice =
    typeof product.price === "number"
      ? product.price
      : (variant as { price?: number; priceMinor?: number } | undefined)?.price ??
        (variant as { priceMinor?: number } | undefined)?.priceMinor;
  const displayPrice =
    typeof rawPrice === "number"
      ? product.variants?.length > 1
        ? `From ${formatPrice(rawPrice)}`
        : formatPrice(rawPrice)
      : null;
  const sizesLabel =
    product.variants?.length > 1
      ? product.variants.map((v) => v.size).join(" / ")
      : variant?.size;
  const imageSrc =
    (product as { imageUrl?: string | null }).imageUrl || product.image || null;
  const stockLabel =
    product.stockStatus === "out-of-stock"
      ? "Out of stock"
      : product.stockStatus === "low"
      ? "Low stock"
      : "In stock";

  return (
    <article className="ui-card ui-product-card ui-card--raised group transition-shadow duration-200 hover:shadow-md flex flex-col h-full">
      <Link
        href={`/shop/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="relative block ui-overflow-clip bg-surface-muted no-underline"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            width={400}
            height={500}
            className="ui-product-card__image transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="ui-product-card__image flex items-center justify-center p-6 text-center text-caption text-ink-muted"
            aria-hidden="true"
          >
            <span>Verified image pending</span>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-primary-foreground">
            {BADGE_LABELS[product.badge]}
          </span>
        )}
        <span
          className={[
            "absolute top-3 right-3 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wide",
            product.stockStatus === "out-of-stock"
              ? "bg-surface/95 text-danger border border-danger/30"
              : product.stockStatus === "low"
              ? "bg-accent-soft text-accent border border-accent/30"
              : "bg-surface/95 text-success border border-hairline",
          ].join(" ")}
        >
          {stockLabel}
        </span>
      </Link>

      <div className="ui-product-card__body flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {product.category && (
            <p className="text-caption font-bold uppercase tracking-wider text-primary m-0">
              {product.category}
            </p>
          )}
          <h3 className="ui-product-card__title">
            <Link
              href={`/shop/${product.slug}`}
              className="no-underline hover:text-primary transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          {product.subtitle ? (
            <p className="ui-product-card__meta">{product.subtitle}</p>
          ) : (
            product.concerns?.length > 0 && (
              <p className="ui-product-card__meta">
                {product.concerns
                  .slice(0, 2)
                  .map((c) => CONCERN_LABELS[c] ?? c)
                  .join(" · ")}
              </p>
            )
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-hairline flex items-baseline justify-between gap-2">
          {displayPrice ? (
            <div className="flex items-baseline gap-2">
              <p className="ui-product-card__price text-ink">{displayPrice}</p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-caption text-ink-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-caption text-ink-muted">Price pending</span>
          )}
          {sizesLabel && (
            <span className="text-caption text-ink-muted">{sizesLabel}</span>
          )}
        </div>
      </div>
    </article>
  );
}
