import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/customer";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = { title: "Your orders" };

export default async function OrdersPage() {
  const { supabase, user } = await requireCustomer("/account/orders");
  const { data: orders, error } = await supabase.from("orders").select("id,order_number,created_at,status,total_kobo,order_items(count)").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) console.error("Order history query failed:", error.message);
  return <section className="section customer-page"><div className="wrap"><div className="customer-heading"><span className="eyebrow">Your account</span><h1>Your orders.</h1><p>A record of the pieces you’ve brought home.</p></div><div className="account-subnav"><Link href="/account">Account</Link><span>/</span><span>Orders</span></div>{error ? <div className="customer-empty"><h2>Your orders aren’t available right now.</h2><p>Please try again in a little while.</p></div> : !orders?.length ? <div className="customer-empty"><h2>You haven’t placed any orders yet.</h2><p>Your orders will appear here after you place one.</p><Link href="/shop" className="button button-dark">Start shopping <span aria-hidden="true">↗</span></Link></div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div><span className="eyebrow">{order.order_number}</span><p>{new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(new Date(order.created_at))}</p></div><div><span className={`status-badge status-${order.status}`}>{order.status}</span><p>{order.order_items?.[0]?.count ?? 0} items</p></div><strong>{formatNaira(order.total_kobo)}</strong><Link className="text-link" href={`/account/orders/${order.id}`}>View order <span aria-hidden="true">↗</span></Link></article>)}</div>}</div></section>;
}
