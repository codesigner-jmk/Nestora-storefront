import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-brand"><Link className="wordmark footer-wordmark" href="/">NESTORA<span>.</span></Link><p>Furniture for the everyday moments that make a home.</p></div>
        <div className="footer-column"><h2>Explore</h2><Link href="/shop">All furniture</Link><Link href="/#categories">Collections</Link><Link href="/shop?sort=price_asc">Shop by price</Link></div>
        <div className="footer-column"><h2>Your account</h2><Link href="/account">My account</Link><Link href="/account/orders">Orders</Link><Link href="/wishlist">Wishlist</Link></div>
        <div className="footer-note"><span className="eyebrow">A considered home</span><p>Pieces chosen to live with you, and live well.</p></div>
      </div>
      <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} NESTORA</span><span>Modern furniture for modern living.</span><span>Made for living.</span></div>
    </footer>
  );
}
