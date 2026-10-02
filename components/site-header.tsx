import Link from "next/link";
import { BagIcon, HeartIcon, SearchIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="wordmark" href="/" aria-label="NESTORA home">NESTORA<span>.</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/shop">Shop</Link>
          <Link href="/#categories">Categories</Link>
          <Link href="/#story">Our approach</Link>
        </nav>
        <div className="header-actions">
          <Link className="icon-link search-link" href="/shop" aria-label="Search furniture"><SearchIcon /></Link>
          <Link className="icon-link" href="/wishlist" aria-label="Wishlist"><HeartIcon /></Link>
          <Link className="icon-link bag-link" href="/cart" aria-label="Shopping bag"><BagIcon /></Link>
          <ThemeToggle />
          <Link className="account-link" href="/account">Account</Link>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/shop">Shop</Link><Link href="/#categories">Categories</Link><Link href="/wishlist">Wishlist</Link><Link href="/account">Account</Link>
      </nav>
    </header>
  );
}
