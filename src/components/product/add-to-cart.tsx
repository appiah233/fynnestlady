"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];
  const inStock =
    product.stockStatus !== "out-of-stock" && (selectedVariant?.stock ?? 0) > 0;
  const activePrice = selectedVariant?.price ?? product.price;

  const handleAdd = () => {
    if (!selectedVariant || !inStock) return;
    addItem(product, selectedVariant.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 border-t border-hairline pt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-utility font-bold m-0">Select Size</h2>
          <span className="font-display text-subheading text-ink">
            {formatPrice(activePrice)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Available sizes">
          {product.variants.map((v) => {
            const isSelected = v.id === selectedVariant?.id;
            const variantInStock = product.stockStatus !== "out-of-stock" && v.stock > 0;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedVariantId(v.id)}
                className={[
                  "min-h-11 px-4 py-2 rounded-sm text-utility font-bold text-sm border transition-colors",
                  isSelected
                    ? "bg-primary-soft border-primary text-primary"
                    : variantInStock
                    ? "border-hairline hover:bg-surface-muted text-ink"
                    : "border-danger text-danger opacity-50",
                ].join(" ")}
                disabled={!variantInStock}
              >
                {v.size} &middot; {formatPrice(v.price)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={!inStock || quantity === 1}
          aria-label="Decrease quantity"
          className="flex h-11 w-11 items-center justify-center rounded-sm border border-hairline text-ink hover:bg-surface-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-1"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          min={1}
          aria-label="Quantity"
          value={quantity}
          onChange={(e) => {
            const v = Math.max(1, parseInt(e.currentTarget.value, 10) || 1);
            setQuantity(v);
          }}
          className="w-14 h-11 text-center border border-hairline rounded-sm text-ink text-utility font-bold"
        />
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          disabled={!inStock}
          aria-label="Increase quantity"
          className="flex h-11 w-11 items-center justify-center rounded-sm border border-hairline text-ink hover:bg-surface-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-1"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Button
        variant="primary"
        onClick={handleAdd}
        disabled={!inStock}
        className="w-full"
        loading={added}
      >
        {added ? (
          <>
            <ShoppingCart className="w-4 h-4" /> Added to cart
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" /> Add to Cart &middot;{" "}
            {formatPrice(activePrice * quantity)}
          </>
        )}
      </Button>

      {!inStock && (
        <p className="text-caption text-danger font-bold">
          Currently unavailable
        </p>
      )}
    </div>
  );
}
