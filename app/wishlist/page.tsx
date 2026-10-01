import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/customer";
import { formatNaira } from "@/lib/format";
import { addToCart, removeWishlistItem } from "@/app/actions/customer";

export const metadata: Metadata = { title: "Your wishlist" };

export default async function WishlistPage({ searchParams }: { searchParams: Promise<{ error?: string; updated?: string }> }) {
  const { supabase, user } = await requireCustomer("/wishlist");
  const params = await searchParams;
  const { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", user.id).maybeSingle();
  const { data: items } = wishlist
    ? await supabase.from("wishlist_items").select("id,product_id").eq("wishlist_id", wishlist.id)
    : { data: [] };
  const productIds = (items ?? []).map((item) => item.product_id);
  const { data: products } = productIds.length
    ? await supabase.from("products").select("id,name,slug,price_kobo,stock_quantity,is_active,product_images(image_url,alt_text,display_order)").in("id", productIds)
    : { data: [] };
  const productsById = new Map((products ?? []).map((product) => [product.id, product] as const));
  const saved = (items ?? []).flatMap((item) => {
    const product = productsById.get(item.product_id);
    return product?.is_active ? [{ id: item.id, product }] : [];
  });
  return <section className="section customer-page"><div className="wrap"><div className="customer-heading"><span className="eyebrow">Saved for later</span><h1>Your wishlist.</h1><p>Keep the pieces you love close at hand.</p></div>{params.error && <p className="form-error customer-notice" role="alert">We couldn’t update your wishlist. Please try again.</p>}{params.updated && <p className="success-message customer-notice" role="status">Your wishlist is updated.</p>}
    {!saved.length ? <div className="customer-empty"><h2>Your wishlist is empty.</h2><p>Save pieces you love and come back to them later.</p><Link href="/shop" className="button button-dark">Explore furniture <span aria-hidden="true">↗</span></Link></div> : <div className="product-grid wishlist-grid">{saved.map(({ id, product }) => { const image = [...(product.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)[0]; return <article className="product-card" key={id}><div className="product-image-wrap"><Link href={`/shop/${product.slug}`} aria-label={`View ${product.name}`}>{image && <Image src={image.image_url} alt={image.alt_text || product.name} fill sizes="(max-width: 640px) 48vw, 23vw" className="product-image" />}</Link><form action={removeWishlistItem}><input type="hidden" name="itemId" value={id} /><button className="wishlist-control" type="submit" aria-label={`Remove ${product.name} from wishlist`}>×</button></form></div><div className="product-card-copy"><div><Link className="product-name" href={`/shop/${product.slug}`}>{product.name}</Link><p>{product.stock_quantity > 0 ? "Available to order" : "Currently unavailable"}</p></div><span className="product-price">{formatNaira(product.price_kobo)}</span></div><form action={addToCart} className="wishlist-add-form"><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="quantity" value="1" /><input type="hidden" name="returnTo" value="/wishlist" /><button className="text-link" type="submit" disabled={product.stock_quantity < 1}>Add to cart</button></form></article>; })}</div>}
  </div></section>;
}
