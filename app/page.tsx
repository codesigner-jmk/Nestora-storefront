import Image from "next/image";
import Link from "next/link";
import { BagIcon } from "@/components/icons";
import { BestSellers, FeaturedCategories, FeaturedProducts, Newsletter, Promotion, TrustStripe, WhyShop } from "@/components/home-sections";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ newsletter?: string }> }) {
  const { newsletter } = await searchParams;
  return <>
    <section className="hero-section"><div className="wrap hero-layout"><div className="hero-copy"><span className="eyebrow">The NESTORA collection</span><h1>Modern pieces.<br /><em>Made for living.</em></h1><p>Furniture for slow mornings, long dinners and the everyday in between.</p><div className="hero-actions"><Link className="button button-dark" href="/shop">Shop furniture <span aria-hidden="true">↗</span></Link><Link className="hero-secondary" href="/#categories">Explore by room <span aria-hidden="true">↓</span></Link></div><div className="hero-aside"><span>01 / 04</span><span>Pieces with room to breathe.</span></div></div><div className="hero-visual"><div className="hero-image"><Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=90" alt="Warm, sunlit living room with a sculptural sofa and natural materials" fill priority sizes="(max-width: 760px) 100vw, 56vw" /></div><div className="hero-image-caption"><span>A place to settle in</span><span>01 — Living</span></div><div className="hero-stamp"><BagIcon size={18} /><span>Thoughtful furniture<br />for modern living</span></div></div></div></section>
    <FeaturedCategories />
    <BestSellers />
    <Promotion />
    <FeaturedProducts />
    <TrustStripe />
    <WhyShop />
    <Newsletter status={newsletter} />
  </>;
}
