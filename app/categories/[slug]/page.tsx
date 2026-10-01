import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/products/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((item) => item.slug === slug);
  return { title: category?.name ?? "Furniture" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const products = await getProducts({ category: category.id, limit: 48 });
  return <section className="section shop-page"><div className="wrap"><div className="shop-intro"><span className="eyebrow">Explore by room</span><h1>{category.name} for living.</h1><p>{category.description ?? "Considered pieces for the rooms you return to."}</p></div>{products.length ? <div className="product-grid shop-grid category-products">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="shop-empty"><h2>This collection is taking shape.</h2><p>We’re preparing pieces for this collection. Explore all furniture in the meantime.</p><Link href="/shop" className="button button-dark">Browse all furniture</Link></div>}</div></section>;
}
