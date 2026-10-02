import Link from "next/link";
import { BagIcon } from "@/components/icons";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { BestSellers, FeaturedCategories, FeaturedProducts, IntroducingNestora, Newsletter, Promotion, TrustStripe, OurStory } from "@/components/home-sections";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ newsletter?: string }> }) {
  const { newsletter } = await searchParams;
  return <>
    <section className="hero-section"><div className="wrap hero-layout"><div className="hero-copy"><span className="eyebrow">The NESTORA collection</span><h1>Modern pieces.<br /><em>Made for living.</em></h1><p>Furniture for slow mornings, long dinners and the everyday in between.</p><div className="hero-actions"><Link className="button button-dark" href="/shop">Shop furniture <span aria-hidden="true">↗</span></Link><Link className="hero-secondary" href="/#categories">Explore by room <span aria-hidden="true">↓</span></Link></div><div className="hero-aside"><span>Pieces with room to breathe.</span></div></div><div className="hero-visual" role="region" aria-label="NESTORA interior slideshow"><HeroSlideshow /><div className="hero-stamp"><BagIcon size={18} /><span>Thoughtful furniture<br />for modern living</span></div></div></div></section>
    <FeaturedCategories />
    <Promotion />
    <BestSellers />
    <IntroducingNestora />
    <TrustStripe />
    <FeaturedProducts />
    <OurStory />
    <Newsletter status={newsletter} />
  </>;
}
