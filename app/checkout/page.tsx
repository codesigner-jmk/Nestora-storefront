import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/customer";
import { formatNaira } from "@/lib/format";
import { createOrder } from "./actions";

export const metadata: Metadata = { title: "Checkout" };
const errors: Record<string, string> = {
  details: "Please review your contact and delivery information.",
  delivery: "Checkout is not available until the store delivery fee is configured.",
  empty: "Your bag is empty. Add a piece before checking out.",
  stock: "A product quantity changed. Review your bag and try again.",
  place: "We couldn’t place your order. Your bag is still saved; please try again.",
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase, user } = await requireCustomer("/checkout");
  const { error: reason } = await searchParams;
  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).maybeSingle();
  const { data: items } = cart ? await supabase.from("cart_items").select("id,quantity,product:products(name,slug,price_kobo,is_active,product_images(image_url,alt_text,display_order)),variant:product_variants(name,value,price_modifier_kobo)").eq("cart_id", cart.id) : { data: [] };
  const lines = (items ?? []).filter((item) => item.product?.is_active);
  const { data: settings } = await supabase.from("store_settings").select("standard_delivery_fee_kobo").eq("id", true).maybeSingle();
  const subtotal = lines.reduce((sum, line) => sum + (line.product.price_kobo + (line.variant?.price_modifier_kobo ?? 0)) * line.quantity, 0);
  const fee = settings?.standard_delivery_fee_kobo ?? null;
  return <section className="section customer-page checkout-page"><div className="wrap"><div className="customer-heading"><span className="eyebrow">Almost home</span><h1>Review your order.</h1><p>We’ll confirm each detail before placing it.</p></div>{reason && errors[reason] && <p className="form-error customer-notice" role="alert">{errors[reason]}</p>}{!lines.length ? <div className="customer-empty"><h2>Your bag is empty.</h2><p>Add a piece before continuing to checkout.</p><Link href="/shop" className="button button-dark">Explore furniture</Link></div> : <form action={createOrder} className="checkout-layout"><div className="checkout-fields"><div className="checkout-form-section"><span className="eyebrow">01 / Contact</span><h2>Your details</h2><label>Full name<input name="customerName" autoComplete="name" required minLength={2} maxLength={120} defaultValue={user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""} /></label><label>Email address<input name="customerEmail" type="email" autoComplete="email" required maxLength={254} defaultValue={user.email ?? ""} /></label><label>Phone number<input name="customerPhone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} /></label></div><div className="checkout-form-section"><span className="eyebrow">02 / Delivery</span><h2>Where should it go?</h2><label>Street address<input name="address" autoComplete="street-address" required minLength={5} maxLength={300} /></label><div className="checkout-two-col"><label>City<input name="city" autoComplete="address-level2" required maxLength={100} /></label><label>State<input name="state" autoComplete="address-level1" required maxLength={100} /></label></div><label>Delivery notes <span className="optional-label">Optional</span><textarea name="notes" rows={3} maxLength={500} /></label></div></div><aside className="order-summary checkout-summary"><h2>Your bag</h2>{lines.map((line) => { const image = [...(line.product.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)[0]; return <div className="checkout-line" key={line.id}>{image && <div className="checkout-thumb"><Image src={image.image_url} alt={image.alt_text || line.product.name} fill sizes="56px" /></div>}<div><strong>{line.product.name}</strong><span>Qty {line.quantity}{line.variant ? ` · ${line.variant.value}` : ""}</span></div><span>{formatNaira((line.product.price_kobo + (line.variant?.price_modifier_kobo ?? 0)) * line.quantity)}</span></div>; })}<div><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div><div><span>Delivery</span><span>{fee == null ? "Not configured" : formatNaira(fee)}</span></div><div className="summary-total"><strong>Total</strong><strong>{fee == null ? "—" : formatNaira(subtotal + fee)}</strong></div>{fee == null ? <p className="summary-help">We’ll enable order placement when NESTORA’s standard delivery fee is set.</p> : <><p className="summary-help">This website records your order but does not collect payment.</p><button className="button button-dark checkout-link" type="submit">Place order <span aria-hidden="true">↗</span></button></>}</aside></form>}</div></section>;
}
