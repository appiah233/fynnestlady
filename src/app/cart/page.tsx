"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { Trash2, Plus, ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/status";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/data/products";

export default function CartPage() {
  const { items, total, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="py-20 sm:py-24">
        <div className="container-page">
          <EmptyState title="Your cart is empty">
            <p className="text-body text-ink-muted max-w-[32rem] mx-auto">
              No items yet. Explore the collection and add products to your
              cart.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 min-w-[14rem] bg-primary text-primary-foreground rounded-sm px-6 py-4 font-bold text-utility uppercase tracking-wider transition-colors hover:bg-primary-hover focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Shop Skincare <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </EmptyState>
        </div>
      </div>
    );
  }
  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h1 className="font-display text-heading">Your Cart</h1>
            <p className="text-body-sm text-ink-muted">
              {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-utility font-bold hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Continue shopping
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => {
              const variant = item.product.variants.find(
                (v) => v.id === item.variantId,
              );
              const unitPrice = variant?.price ?? item.product.price;
              const lineTotal = unitPrice * item.quantity;
              return (
                <CartItem
                  key={`${item.product.id}-${item.variantId}`}
                  item={item}
                  variant={variant}
                  unitPrice={unitPrice}
                  lineTotal={lineTotal}
                />
              );
            })}
          </div>

          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <CartTotals total={total} itemCount={itemCount} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItem({
  item,
  variant,
  unitPrice,
  lineTotal,
}: {
  item: { product: Product; variantId: string; quantity: number };
  variant: { size: string; price: number; stock: number } | undefined;
  unitPrice: number;
  lineTotal: number;
}) {
  const { updateQuantity, removeItem } = useCart();
  const [localQty, setLocalQty] = useState(item.quantity);

  const handleChange = (next: number) => {
    if (next < 1) return;
    setLocalQty(next);
    updateQuantity(item.product.id, item.variantId, next);
  };

  return (
    <div className="flex gap-4 items-center border border-hairline rounded-[var(--radius-md)] p-4 sm:p-6 bg-surface-panel shadow-sm">
      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-hairline bg-surface-muted">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover object-center"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link
            href={`/shop/${item.product.slug}`}
            prefetch
            className="ui-link text-subheading line-clamp-1"
          >
            {item.product.name}
          </Link>
          {variant && (
            <span className="text-caption text-ink-muted border border-hairline rounded-sm px-1.5 py-0.5">
              {variant.size}
            </span>
          )}
        </div>
        <p className="text-caption text-ink-muted">
          {formatPrice(unitPrice)} each
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleChange(localQty - 1)}
            disabled={localQty === 1}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-hairline text-ink hover:bg-surface-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-utility font-bold min-w-[2rem] text-center">{localQty}</span>
          <button
            type="button"
            onClick={() => handleChange(localQty + 1)}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-hairline text-ink hover:bg-surface-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-heading">{formatPrice(lineTotal)}</span>
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.product.id, item.variantId)}
          aria-label="Remove item"
          className="text-caption text-danger font-bold hover:underline mt-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function CartTotals({ total, itemCount }: { total: number; itemCount: number }) {
  return (
    <div className="ui-card--panel shadow-sm p-6 sm:p-8">
      <h2 className="font-display text-subheading mb-6">Order summary</h2>
      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-body">
          <span className="text-ink-muted">Subtotal ({itemCount} items)</span>
          <span className="font-bold">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-body">
          <span className="text-ink-muted">Delivery</span>
          <span className="font-bold">Calculated at checkout</span>
        </div>
      </div>
      <div className="border-t border-hairline pt-6 space-y-3">
        <div className="flex justify-between text-heading font-bold text-ink">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Button variant="primary" className="w-full mt-6" disabled={itemCount === 0}>
          Proceed to Checkout
        </Button>
        <p className="text-caption text-ink-muted text-center">
          Checkout entry point &mdash; Paystack payment integration is next.
        </p>
      </div>
    </div>
  );
}
