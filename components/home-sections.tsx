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
  const categoryOrder = ["sofas", "beds", "dining", "tables", "chairs", "storage", "lighting"];
  const featuredCategories = [...categories].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.slug);
    const bIndex = categoryOrder.indexOf(b.slug);
    return (aIndex < 0 ? categoryOrder.length : aIndex) - (bIndex < 0 ? categoryOrder.length : bIndex);
  });
  return <section className="section categories-section" id="categories"><div className="wrap">
    <div className="section-heading category-heading"><div><span className="eyebrow">Shop by category</span><h2>Find furniture for every space.</h2></div><Link className="text-link" href="/shop">View all <span aria-hidden="true">↗</span></Link></div>
    {featuredCategories.length ? <div className="category-row">{featuredCategories.map((category) => { const imageUrl = category.image_url || categoryImages[category.slug]; return <Link className="category-chip" key={category.id} href={`/categories/${category.slug}`}>
      <span className="category-avatar">{imageUrl ? <Image src={imageUrl} alt="" fill sizes="120px" /> : <span className="category-placeholder">{category.name}</span>}</span>
      <span className="category-label">{category.name}</span>
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
  return <section className="promo-section" aria-label="Explore furniture collections"><div className="wrap">
    <div className="promo-card-grid">
      <Link className="promo-card promo-card-living" href="/categories/sofas"><span className="promo-card-copy"><span className="eyebrow">Living room</span><strong>Room to<br />settle in.</strong><span className="promo-card-link">Explore the collection <span aria-hidden="true">↗</span></span></span><span className="promo-card-image"><Image src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=88" alt="Soft neutral sofa in a considered living room" fill sizes="(max-width: 640px) 90vw, 42vw" /></span></Link>
      <Link className="promo-card promo-card-bedroom" href="/categories/beds"><span className="promo-card-copy"><span className="eyebrow">Bedroom essentials</span><strong>Restful.<br />Simply yours.</strong><span className="promo-card-link">Find your quiet <span aria-hidden="true">↗</span></span></span><span className="promo-card-image"><Image src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=88" alt="A calm bedroom with natural wood and soft linens" fill sizes="(max-width: 640px) 90vw, 42vw" /></span></Link>
    </div>
    <Link className="promo-feature" href="/shop"><Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90" alt="A warm, contemporary home with natural materials" fill sizes="(max-width: 760px) 100vw, 92vw" /><span className="promo-feature-shade" /><span className="promo-feature-copy"><span className="eyebrow">A considered collection</span><strong>Make room for<br />the moments that matter.</strong><span className="button button-dark">Explore NESTORA <span aria-hidden="true">↗</span></span></span></Link>
  </div></section>;
}

export function TrustStripe() {
  return <section className="trust-stripe" aria-label="Shopping with NESTORA"><div className="trust-visual"><Image src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2000&q=88" alt="A warm wood console styled with simple home objects" fill sizes="100vw" /><div className="trust-visual-caption"><span className="eyebrow">Considered for your home</span><span>Furniture for the everyday.</span></div></div><div className="wrap trust-items">
    <div className="trust-item"><span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 4c-8 0-14 4-14 11a5 5 0 0 0 5 5c7 0 11-6 9-16Z"/><path d="M5 21c2-5 6-9 12-12"/></svg></span><span><strong>Thoughtful selection</strong><small>Pieces for the spaces you live in.</small></span></div>
    <div className="trust-item"><span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h11M4 18h8"/><circle cx="18" cy="17" r="3"/></svg></span><span><strong>Clear pricing</strong><small>See each price before you order.</small></span></div>
    <div className="trust-item"><span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 7h11v11H3zM14 11h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg></span><span><strong>Delivery shown upfront</strong><small>Standard delivery is ₦6,500.</small></span></div>
    <div className="trust-item"><span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM8 9h8M8 13h5"/><path d="m15 17 2 2 4-5"/></svg></span><span><strong>Your order, in one place</strong><small>View details in your account.</small></span></div>
  </div></section>;
}

export function IntroducingNestora() {
  return <section className="introducing-section"><div className="wrap introducing-layout"><div className="introducing-image"><Image src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=88" alt="Quiet, naturally lit interior with contemporary furniture" fill sizes="(max-width: 760px) 100vw, 48vw" /></div><div className="introducing-copy"><span className="eyebrow">Introducing NESTORA</span><h2>Furniture for<br />the life you live.</h2><p>We believe the best rooms are shaped by how they feel: welcoming, useful, and unmistakably yours. NESTORA brings together furniture and home pieces for all the moments that make a place home.</p><Link className="text-link" href="/shop">Explore the collection <span aria-hidden="true">↗</span></Link></div></div></section>;
}

export function OurStory() {
  return <section className="section story-section" id="story"><div className="wrap story-layout"><div><span className="eyebrow">Our story</span><h2>A little more<br /><em>considered.</em></h2></div><div className="story-copy"><p>Home is never just a place. It’s the long dinner, the quiet morning, the chair everyone reaches for. We bring together useful, thoughtful pieces for the moments in between.</p><Link className="text-link" href="/shop">Find your place in the collection <span aria-hidden="true">↗</span></Link></div></div></section>;
}

export function Newsletter({ status }: { status?: string }) {
  const messages: Record<string, string> = { success: "You’re on the list. Thank you.", invalid: "Please enter a valid email address.", setup: "Newsletter sign-up will be available once the store database is connected.", error: "We couldn’t save your subscription. Please try again." };
  return <section className="newsletter-section" id="newsletter"><div className="wrap newsletter-inner"><div><span className="eyebrow">A note from home</span><h2>Good things, occasionally.</h2><p>New arrivals, thoughtful ideas and a little inspiration for your space.</p></div><form className="newsletter-form" action={subscribeToNewsletter}><label className="visually-hidden" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" name="email" placeholder="Your email address" required /><button type="submit" aria-label="Subscribe to the NESTORA newsletter">Subscribe <span aria-hidden="true">↗</span></button><small aria-live="polite">{status && messages[status] ? messages[status] : "By subscribing, you agree to receive occasional emails from NESTORA."}</small></form></div></section>;
}
