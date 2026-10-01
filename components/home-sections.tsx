import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/products/queries";
import { ProductCard } from "@/components/product-card";
import { subscribeToNewsletter } from "@/app/newsletter/actions";

const categoryImages: Record<string, string> = {
  sofas: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
  chairs: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85",
  dining: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=85",
  beds: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",
};

export async function FeaturedCategories() {
  const categories = await getCategories();
  const featuredCategories = ["sofas", "chairs", "dining", "beds"]
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is (typeof categories)[number] => Boolean(category));
  return <section className="section categories-section" id="categories"><div className="wrap">
    <div className="section-heading"><div><span className="eyebrow">Find your starting point</span><h2>Rooms, reimagined.</h2></div><Link className="text-link" href="/shop">Explore all furniture <span aria-hidden="true">↗</span></Link></div>
    {categories.length ? <div className="category-grid">{featuredCategories.map((category) => { const imageUrl = category.image_url || categoryImages[category.slug]; return <Link className="category-tile" key={category.id} href={`/categories/${category.slug}`}>
      <div className="category-image">{imageUrl ? <Image src={imageUrl} alt={`${category.name} furniture`} fill sizes="(max-width: 640px) 48vw, 25vw" /> : <span className="category-placeholder">{category.name}</span>}</div>
      <div className="category-title"><span>{category.name}</span><span aria-hidden="true">↗</span></div>
    </Link>; })}</div> : <div className="catalogue-note">Our collections are being prepared. Check back soon.</div>}
  </div></section>;
}

export async function BestSellers() {
  const products = await getProducts({ bestSellers: true, limit: 4 });
  return <section className="section best-sellers-section"><div className="wrap">
    <div className="section-heading"><div><span className="eyebrow">The NESTORA edit</span><h2>Best sellers.</h2><p>Considered forms, chosen for everyday living.</p></div><Link className="text-link" href="/shop">Shop the collection <span aria-hidden="true">↗</span></Link></div>
    {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalogue-note">Our selected best sellers will appear here.</div>}
  </div></section>;
}

export async function FeaturedProducts() {
  const products = await getProducts({ featured: true, limit: 4 });
  return <section className="section featured-section"><div className="wrap">
    <div className="section-heading"><div><span className="eyebrow">The NESTORA edit</span><h2>Made to feel like home.</h2></div><Link className="text-link" href="/shop">Discover all pieces <span aria-hidden="true">↗</span></Link></div>
    {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalogue-note">New pieces are being added to the collection.</div>}
  </div></section>;
}

export function Promotion() {
  return <section className="promotion-section"><div className="promotion-image"><Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90" alt="Quiet contemporary living space with natural textures and warm light" fill sizes="100vw" /></div><div className="promotion-shade" /><div className="wrap promotion-content"><span className="eyebrow">Introducing NESTORA</span><h2>The first edit,<br />made for living.</h2><p>A considered collection of furniture for rooms that welcome you in.</p><Link className="button button-light" href="/shop">Explore the collection <span aria-hidden="true">↗</span></Link></div></section>;
}

export function TrustStripe() {
  return <section className="trust-stripe"><div className="wrap trust-items"><p><span>01</span> Thoughtfully selected</p><p><span>02</span> Clear, considered pricing</p><p><span>03</span> Furniture for everyday living</p></div></section>;
}

export function WhyShop() {
  return <section className="section why-section" id="story"><div className="wrap why-layout"><div><span className="eyebrow">A little more considered</span><h2>Good furniture<br />makes room for life.</h2></div><div className="why-copy"><p>Home is never just a place. It’s the long dinner, the quiet morning, the chair everyone reaches for. We bring together useful, enduring pieces for the moments in between.</p><Link className="text-link" href="/shop">Meet your next favourite <span aria-hidden="true">↗</span></Link></div></div><div className="wrap benefit-row"><div><span>01</span><h3>Made for daily life</h3><p>Comfort and function belong in the same room.</p></div><div><span>02</span><h3>Room to choose</h3><p>Pieces with a point of view, easy to make your own.</p></div><div><span>03</span><h3>Considered details</h3><p>Materials and forms chosen with care.</p></div></div></section>;
}

export function Newsletter({ status }: { status?: string }) {
  const messages: Record<string, string> = { success: "You’re on the list. Thank you.", invalid: "Please enter a valid email address.", setup: "Newsletter sign-up will be available once the store database is connected.", error: "We couldn’t save your subscription. Please try again." };
  return <section className="newsletter-section" id="newsletter"><div className="wrap newsletter-inner"><div><span className="eyebrow">A note from home</span><h2>Good things, occasionally.</h2><p>New arrivals, thoughtful ideas and a little inspiration for your space.</p></div><form className="newsletter-form" action={subscribeToNewsletter}><label className="visually-hidden" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" name="email" placeholder="Your email address" required /><button type="submit" aria-label="Subscribe to the NESTORA newsletter">Subscribe <span aria-hidden="true">↗</span></button><small aria-live="polite">{status && messages[status] ? messages[status] : "By subscribing, you agree to receive occasional emails from NESTORA."}</small></form></div></section>;
}
