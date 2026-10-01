import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/products/queries";

export const metadata: Metadata = { title: "Shop furniture", description: "Explore the NESTORA furniture collection." };
type SearchParams = Promise<{ search?: string; category?: string; sort?: string; min_price?: string; max_price?: string; availability?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categories = await getCategories();
  const activeCategory = categories.find((category) => category.slug === params.category);
  const minPrice = params.min_price && Number.isFinite(Number(params.min_price)) && Number(params.min_price) >= 0 ? Math.round(Number(params.min_price) * 100) : undefined;
  const maxPrice = params.max_price && Number.isFinite(Number(params.max_price)) && Number(params.max_price) >= 0 ? Math.round(Number(params.max_price) * 100) : undefined;
  const products = await getProducts({ search: params.search, category: activeCategory?.id, sort: params.sort, minPriceKobo: minPrice, maxPriceKobo: maxPrice, inStock: params.availability === "in_stock", limit: 48 });
  return <section className="shop-page section"><div className="wrap">
    <div className="shop-intro"><span className="eyebrow">The collection</span><h1>{activeCategory?.name ?? "Furniture for living."}</h1><p>Considered pieces for the rooms you return to.</p></div>
    <form className="shop-toolbar" action="/shop"><label className="search-field"><span className="visually-hidden">Search furniture</span><input name="search" defaultValue={params.search} placeholder="Search furniture" /></label><select name="category" defaultValue={params.category ?? ""} aria-label="Filter by category"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select><input className="price-filter" name="min_price" type="number" min="0" placeholder="Min ₦" aria-label="Minimum price in Naira" defaultValue={params.min_price} /><input className="price-filter" name="max_price" type="number" min="0" placeholder="Max ₦" aria-label="Maximum price in Naira" defaultValue={params.max_price} /><select name="availability" defaultValue={params.availability ?? ""} aria-label="Filter by availability"><option value="">Any availability</option><option value="in_stock">In stock</option></select><select name="sort" defaultValue={params.sort ?? "newest"} aria-label="Sort products"><option value="newest">Newest</option><option value="featured">Featured</option><option value="best_selling">Best sellers</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select><button className="button button-dark" type="submit">Apply</button></form>
    {products.length ? <div className="product-grid shop-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="shop-empty"><span className="eyebrow">A fresh start</span><h2>{params.search ? "No pieces found just yet." : "The collection is taking shape."}</h2><p>{params.search ? "Try another search, or browse the full collection." : "We’re preparing a considered collection for your home. Check back soon."}</p><Link href="/shop" className="button button-dark">Browse all furniture</Link></div>}
  </div></section>;
}
