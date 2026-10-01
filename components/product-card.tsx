import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/lib/products/types";
import { AddToWishlistForm } from "@/components/add-to-wishlist-form";

export function ProductCard({ product }: { product: Product }) {
  const image = [...(product.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)[0];
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/shop/${product.slug}`} aria-label={`View ${product.name}`}>
          {image ? <Image src={image.image_url} alt={image.alt_text || product.name} fill sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 23vw" className="product-image" /> : <div className="image-unavailable">Image coming soon</div>}
        </Link>
        <AddToWishlistForm productId={product.id} returnTo={`/shop/${product.slug}`} productName={product.name} />
        {product.is_best_seller && <span className="product-label">BEST SELLER</span>}
      </div>
      <div className="product-card-copy">
        <div><Link className="product-name" href={`/shop/${product.slug}`}>{product.name}</Link><p>{product.category?.name ?? "Furniture"}</p></div>
        <span className="product-price">{formatNaira(product.price_kobo)}</span>
      </div>
    </article>
  );
}
