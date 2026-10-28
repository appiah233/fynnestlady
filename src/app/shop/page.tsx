import { fetchAllProducts } from "@/lib/data/products.server";
import { ShopClient } from "./shop-client";

export default async function ShopPage() {
  const products = await fetchAllProducts();
  return <ShopClient products={products} />;
}
