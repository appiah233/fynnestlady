import Link from "next/link";
import { ProductCard } from "@/components/ui/product-card";
import { fetchAllProducts } from "@/lib/data/products.server";

export async function FeaturedProducts() {
  const products = await fetchAllProducts();
  const categories = [...new Set(products.map((product) => product.category))].slice(0, 4);

  return (
    <section id="catalogue" aria-labelledby="featured-title" className="home-featured">
      <div className="container-page">
        <div className="home-featured__intro">
          <p className="home-eyebrow">The collection</p>
          <h2 id="featured-title">Featured products</h2>
          <p>Explore skincare selected for your everyday routine.</p>
          <nav aria-label="Browse product categories" className="home-category-links">
            <Link href="/shop" className="home-category-links__all">All products</Link>
            {categories.map((category) => (
              <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`}>
                {category}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ui-product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="ui-empty">Product details are being prepared.</p>
        )}
        {products.length > 0 && (
          <div className="home-featured__footer">
            <Link href="/shop" className="home-text-link">
              Shop all {products.length} products <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
