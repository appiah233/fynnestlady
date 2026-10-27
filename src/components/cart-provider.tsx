"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { getAllProducts, type Product } from "@/lib/data/products";

/** Browser cart state records intent only; checkout must reprice on the server. */
export type CartItem = {
  productId: string;
  product: Product;
  variantId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  isOpen: boolean;
  addItem: (productOrId: Product | string, variantId: string, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function fallbackProduct(productId: string, variantId: string): Product {
  return {
    id: productId,
    slug: productId,
    name: productId,
    category: "Skincare",
    price: 0,
    image: "/brand/fynnestlady-logo.jpeg",
    fixture: true,
    stockStatus: "in-stock",
    concerns: ["everyday"],
    skinTypes: ["all"],
    description: "",
    benefits: [],
    howToUse: [],
    keyIngredients: [],
    warnings: [],
    delivery: "",
    variants: [
      {
        id: variantId,
        sku: variantId,
        name: "Standard",
        size: "Standard",
        price: 0,
        stock: 1,
      },
    ],
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const variant = item.product.variants.find((v) => v.id === item.variantId);
        const unitPrice = variant?.price ?? item.product.price ?? 0;
        return sum + unitPrice * item.quantity;
      }, 0),
    [items]
  );

  const addItem = useCallback((productOrId: Product | string, variantId: string, quantity = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    const product =
      typeof productOrId === "string"
        ? getAllProducts().find((p) => p.id === productOrId) ?? fallbackProduct(productOrId, variantId)
        : productOrId;
    const productId = product.id;
    setItems((previous) => {
      const existing = previous.find((item) => item.productId === productId && item.variantId === variantId);
      return existing
        ? previous.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...previous, { productId, product, variantId, quantity }];
    });
  }, []);
  const removeItem = useCallback((productId: string, variantId: string) => {
    setItems((previous) => previous.filter((item) => !(item.productId === productId && item.variantId === variantId)));
  }, []);
  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) return;
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      setItems((previous) =>
        previous.map((item) =>
          item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item
        )
      );
    },
    [removeItem]
  );
  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const value = useMemo(
    () => ({ items, itemCount, total, isOpen, addItem, removeItem, updateQuantity, clear, openCart, closeCart }),
    [items, itemCount, total, isOpen, addItem, removeItem, updateQuantity, clear, openCart, closeCart]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
