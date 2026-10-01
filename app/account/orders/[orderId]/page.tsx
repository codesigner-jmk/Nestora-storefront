import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/auth/customer";
import { formatNaira } from "@/lib/format";

type Props = { params: Promise<{ orderId: string }>; searchParams: Promise<{ email?: string }> };
export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const { email } = await searchParams;
  const { supabase, user } = await requireCustomer(`/account/orders/${orderId}`);
  const { data: order, error } = await supabase.from("orders").select("id,order_number,created_at,status,customer_name,customer_email,customer_phone,delivery_address,delivery_city,delivery_state,delivery_notes,subtotal_kobo,delivery_fee_kobo,total_kobo,order_items(id,product_id,product_name,product_price_kobo,product_image_url,variant_name,quantity,subtotal_kobo)").eq("id", orderId).eq("user_id", user.id).maybeSingle();
  if (error) console.error("Order detail query failed:", error.message);
  if (!order) notFound();
  return <section className="section customer-page"><div className="wrap"><div className="account-subnav"><Link href="/account/orders">← All orders</Link></div><div className="customer-heading"><span className="eyebrow">Order {order.order_number}</span><h1>Thank you.</h1><p>Placed {new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(new Date(order.created_at))}</p></div>{email === "failed" && <p className="customer-notice">Your order is saved, but we couldn’t send the confirmation email. Your order details are here.</p>}{email === "sent" && <p className="success-message customer-notice">Your order confirmation email has been sent.</p>}<div className="order-detail-layout"><div className="order-detail-main"><div className="order-detail-heading"><h2>Items</h2><span className={`status-badge status-${order.status}`}>{order.status}</span></div>{order.order_items.map((item) => <article className="order-item" key={item.id}><div className="order-item-image">{item.product_image_url && <Image src={item.product_image_url} alt={item.product_name} fill sizes="80px" />}</div><div><strong>{item.product_name}</strong>{item.variant_name && <p>{item.variant_name}</p>}<p>Qty {item.quantity} · {formatNaira(item.product_price_kobo)} each</p></div><span>{formatNaira(item.subtotal_kobo)}</span></article>)}<div className="delivery-card"><h2>Delivery details</h2><p>{order.customer_name}<br />{order.customer_phone}<br />{order.delivery_address}<br />{order.delivery_city}, {order.delivery_state}</p>{order.delivery_notes && <p>{order.delivery_notes}</p>}</div></div><aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><span>{formatNaira(order.subtotal_kobo)}</span></div><div><span>Delivery</span><span>{formatNaira(order.delivery_fee_kobo)}</span></div><div className="summary-total"><strong>Total</strong><strong>{formatNaira(order.total_kobo)}</strong></div><p className="summary-help">Your order is recorded as {order.status}. Payment is not collected on this website.</p></aside></div></div></section>;
}
