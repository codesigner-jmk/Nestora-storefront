import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { removeCartItem, setCartQuantity } from "@/app/actions/customer";
import { requireCustomer } from "@/lib/auth/customer";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = { title: "Your cart" };
type SearchParams = Promise<{ error?: string; updated?: string }>;

const errorMessages: Record<string, string> = {
  invalid: "Please check the quantity and try again.",
  unavailable: "A product in your cart is no longer available.",
  stock: "That quantity is above the current available stock.",
  save: "We couldn’t update your cart. Please try again.",
};

export default async function CartPage({ searchParams }: { searchParams: SearchParams }) {
  const { supabase, user } = await requireCustomer("/cart");
  const params = await searchParams;
  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).maybeSingle();
  const { data: items } = cart
    ? await supabase.from("cart_items").select("id,quantity,product:products(id,name,slug,price_kobo,stock_quantity,is_active,product_images(image_url,alt_text,display_order)),variant:product_variants(id,name,value,price_modifier_kobo,stock_quantity)").eq("cart_id", cart.id)
    : { data: [] };
  const { data: settings } = await supabase.from("store_settings").select("standard_delivery_fee_kobo").eq("id", true).maybeSingle();
  const lines = (items ?? []).filter((item) => item.product?.is_active).map((item) => ({
    ...item,
    unitPrice: item.product.price_kobo + (item.variant?.price_modifier_kobo ?? 0),
    available: item.variant?.stock_quantity ?? item.product.stock_quantity,
    image: [...(item.product.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)[0],
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  return (
    <section className="section customer-page">
      <div className="wrap">
        <div className="customer-heading">
          <span className="eyebrow">Your NESTORA cart</span>
          <h1>Take your time.</h1>
          <p>A clear view of the pieces you’ve chosen.</p>
        </div>
        {params.error && errorMessages[params.error] && <p className="form-error customer-notice" role="alert">{errorMessages[params.error]}</p>}
        {params.updated && <p className="success-message customer-notice" role="status">Your cart has been updated.</p>}
        {!lines.length ? (
          <div className="customer-empty">
            <h2>Your cart is empty.</h2>
            <p>Pieces you add will be kept here while you decide.</p>
            <Link href="/shop" className="button button-dark">Continue shopping <span aria-hidden="true">↗</span></Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-lines">
              {lines.map((line) => (
                <article className="cart-line" key={line.id}>
                  <Link href={`/shop/${line.product.slug}`} className="cart-line-image">
                    {line.image && <Image src={line.image.image_url} alt={line.image.alt_text || line.product.name} fill sizes="120px" />}
                  </Link>
                  <div className="cart-line-main">
                    <Link href={`/shop/${line.product.slug}`} className="cart-line-name">{line.product.name}</Link>
                    {line.variant && <p>{line.variant.name}: {line.variant.value}</p>}
                    <span>{formatNaira(line.unitPrice)}</span>
                    <div className="cart-line-controls">
                      <form action={setCartQuantity}>
                        <input type="hidden" name="itemId" value={line.id} />
                        <label className="visually-hidden" htmlFor={`quantity-${line.id}`}>Quantity of {line.product.name}</label>
                        <input id={`quantity-${line.id}`} type="number" name="quantity" defaultValue={line.quantity} min="1" max={line.available} />
                        <button type="submit">Update</button>
                      </form>
                      <form action={removeCartItem}>
                        <input type="hidden" name="itemId" value={line.id} />
                        <button className="remove-link" type="submit">Remove</button>
                      </form>
                    </div>
                  </div>
                  <strong className="cart-line-total">{formatNaira(line.unitPrice * line.quantity)}</strong>
                </article>
              ))}
              <Link href="/shop" className="button button-outline keep-shopping-button">Keep shopping <span aria-hidden="true">↗</span></Link>
            </div>
            <aside className="order-summary">
              <h2>Order summary</h2>
              <div><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
              <div><span>Delivery</span><span>{settings?.standard_delivery_fee_kobo == null ? "To be configured" : formatNaira(settings.standard_delivery_fee_kobo)}</span></div>
              <div className="summary-total">
                <strong>Total</strong>
                <strong>{settings?.standard_delivery_fee_kobo == null ? "—" : formatNaira(subtotal + settings.standard_delivery_fee_kobo)}</strong>
              </div>
              {settings?.standard_delivery_fee_kobo == null
                ? <p className="summary-help">Checkout will open once the standard delivery fee is configured.</p>
                : <Link className="button button-dark checkout-link" href="/checkout">Continue to checkout <span aria-hidden="true">↗</span></Link>}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
