import { notFound } from "next/navigation";
import { CONCERN_LABELS } from "@/lib/data/products";
import {
  fetchProductBySlug,
  fetchAllProducts,
} from "@/lib/data/products.server";
import { formatPrice } from "@/lib/utils";
import { AddToCart } from "@/components/product/add-to-cart";
import { Disclosure } from "@/components/ui/disclosure";
import Image from "next/image";
import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    fetchProductBySlug(slug),
    fetchAllProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const variant = product.variants[0];
  const inStock =
    product.stockStatus !== "out-of-stock" && (variant?.stock ?? 0) > 0;
  const warningsText = Array.isArray(product.warnings)
    ? product.warnings.join(" ")
    : product.warnings;

  return (
    <div className="space-y-0">
      <section className="border-b border-hairline bg-background">
        <div className="container-page py-8 sm:py-10">
          <nav
            className="flex items-center gap-2 text-caption text-ink-muted"
            aria-label="Breadcrumb"
          >
            <Link
              href="/shop"
              className="hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <span aria-hidden="true">&rsaquo;</span>
            <span className="text-ink font-semibold">{product.name}</span>
          </nav>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-page">
          <div className="lg:grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/5] bg-surface-muted ui-overflow-clip rounded-[var(--radius-lg)] border border-hairline">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6 mt-8 lg:mt-0">
              <div className="space-y-3">
                <p className="text-caption text-primary font-bold uppercase tracking-wider m-0">
                  {product.category}
                </p>
                <h1 className="font-display text-heading m-0">
                  {product.name}
                </h1>
                {product.subtitle && (
                  <p className="text-body-sm font-semibold text-ink-muted m-0">
                    {product.subtitle}
                  </p>
                )}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-display text-heading">
                    {product.variants.length > 1
                      ? `From ${formatPrice(product.price)}`
                      : formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-utility text-ink-muted line-through">
                      was {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                <p
                  className={[
                    "text-body-sm font-bold m-0",
                    inStock ? "text-success" : "text-danger",
                  ].join(" ")}
                >
                  {inStock ? "In stock" : "Out of stock"}
                </p>
                <p className="text-body text-ink-muted leading-relaxed pt-2 m-0">
                  {product.description}
                </p>
              </div>

              <AddToCart product={product} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 border-t border-hairline">
        <div className="container-page">
          <h2 className="font-display text-heading mb-10">Product Details</h2>
          <div className="lg:grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              <Disclosure label="Description" openByDefault>
                <p className="text-body text-ink-muted leading-relaxed">
                  {product.description}
                </p>
              </Disclosure>
              <Disclosure label="Key benefits" openByDefault>
                <ul className="space-y-3 list-disc list-inside text-body text-ink-muted leading-relaxed">
                  {product.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure label="How to use">
                <ol className="space-y-3 list-decimal list-inside text-body text-ink-muted leading-relaxed">
                  {product.howToUse.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </Disclosure>
              <Disclosure label="Suitable for">
                <p className="text-body text-ink-muted leading-relaxed">
                  Developed with {product.skinTypes.join(", ")} skin in mind.
                  May be explored in relation to:{" "}
                  {product.concerns.map((c) => CONCERN_LABELS[c]).join(", ")}.
                </p>
              </Disclosure>
              <Disclosure label="Key ingredients">
                <p className="text-body text-ink-muted leading-relaxed">
                  {product.keyIngredients.join(", ")}.
                </p>
              </Disclosure>
              <Disclosure label="Warnings &amp; delivery">
                <p className="text-body text-ink-muted leading-relaxed">
                  {warningsText}
                </p>
                <p className="mt-2 text-body text-ink-muted leading-relaxed">
                  {product.delivery}
                </p>
              </Disclosure>
            </div>

            <div className="lg:col-span-4 mt-10 lg:mt-0">
              <h3 className="font-display text-subheading mb-6">
                Complementary products
              </h3>
              <div className="grid gap-4">
                {allProducts
                  .filter((p) => p.id !== product.id)
                  .slice(0, 3)
                  .map((p) => (
                    <div key={p.id} className="flex gap-3 items-center">
                      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-hairline bg-surface-muted">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover object-center"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <Link
                          href={`/shop/${p.slug}`}
                          prefetch
                          className="ui-link text-subheading leading-tight"
                        >
                          {p.name}
                        </Link>
                        <span className="text-utility font-bold">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
