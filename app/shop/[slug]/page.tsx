import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToWishlistForm } from "@/components/add-to-wishlist-form";
import { addToCart } from "@/app/actions/customer";
import { formatNaira } from "@/lib/format";
import { getProductBySlug } from "@/lib/products/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Furniture" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = [...(product.product_images ?? [])].sort((a, b) => a.display_order - b.display_order);
  const variants = (product.product_variants ?? []).filter((variant) => variant.stock_quantity > 0);
  const available = variants.length ? true : product.stock_quantity > 0;

  return (
    <section className="section product-detail-page">
      <div className="wrap">
        <div className="breadcrumbs">
          <Link href="/shop">Shop</Link><span>/</span><span>{product.category?.name}</span><span>/</span><span>{product.name}</span>
        </div>
        <div className="product-detail-layout">
          <div className="product-gallery">
            {images.map((image, index) => (
              <div className="detail-image" key={image.image_url}>
                <Image src={image.image_url} alt={image.alt_text || product.name} fill priority={index === 0} sizes="(max-width: 760px) 100vw, 54vw" />
              </div>
            ))}
          </div>
          <div className="product-detail-copy">
            <span className="eyebrow">{product.category?.name ?? "NESTORA collection"}</span>
            <h1>{product.name}</h1>
            <p className="detail-price">{formatNaira(product.price_kobo)}</p>
            <p className="detail-description">{product.description}</p>
            <p className="availability">{available ? "Available to order" : "Currently unavailable"}</p>
            <form action={addToCart} className="add-to-cart-form">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="returnTo" value={`/shop/${product.slug}`} />
              {variants.length > 0 && (
                <label className="variant-field">
                  {variants[0].name}
                  <select name="variantId" defaultValue="" required>
                    <option value="" disabled>Choose {variants[0].name.toLowerCase()}</option>
                    {variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.value}{variant.price_modifier_kobo ? ` · ${formatNaira(product.price_kobo + variant.price_modifier_kobo)}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="quantity-field">Quantity<input type="number" name="quantity" min="1" defaultValue="1" max={variants.length ? undefined : product.stock_quantity} required /></label>
              <button className="button button-dark product-add-button" type="submit" disabled={!available}>
                {available ? "Add to cart" : "Out of stock"}
              </button>
            </form>
            <AddToWishlistForm productId={product.id} returnTo={`/shop/${product.slug}`} productName={product.name} variant="text" />
            <div className="product-details">
              <h2>Details</h2>
              <p>SKU <span>{product.sku}</span></p>
              <p>Collection <span>{product.category?.name ?? "Furniture"}</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
