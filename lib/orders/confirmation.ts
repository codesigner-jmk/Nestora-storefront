import type { SupabaseClient } from "@supabase/supabase-js";

type Order = { id: string; order_number: string; subtotal_kobo: number; delivery_fee_kobo: number; total_kobo: number };
type CheckoutDetails = { customerName: string; customerEmail: string; customerPhone: string; address: string; city: string; state: string; notes?: string };
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character); }
function money(kobo: number) { return (kobo / 100).toLocaleString("en-NG"); }
async function sendMail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || !to) throw new Error("resend_configuration_missing");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, html }), cache: "no-store" });
  if (!response.ok) { const body = await response.json().catch(() => null) as { message?: unknown } | null; throw new Error(`resend_http_${response.status}: ${typeof body?.message === "string" ? body.message.slice(0, 300) : "Request rejected"}`); }
}

export async function sendOrderConfirmationEmails(supabase: SupabaseClient, userId: string, order: Order, details: CheckoutDetails) {
  const [{ data: items, error: itemsError }, { data: saved, error: orderError }] = await Promise.all([
    supabase.from("order_items").select("product_name,variant_name,quantity,product_price_kobo,subtotal_kobo").eq("order_id", order.id),
    supabase.from("orders").select("subtotal_kobo,delivery_fee_kobo,total_kobo,delivery_address,delivery_city,delivery_state,delivery_notes,created_at").eq("id", order.id).eq("user_id", userId).maybeSingle(),
  ]);
  const complete = !itemsError && !orderError && Boolean(saved);
  const itemHtml = (items ?? []).map((item) => `<li>${escapeHtml(item.product_name)}${item.variant_name ? ` (${escapeHtml(item.variant_name)})` : ""} × ${item.quantity} — ₦${money(item.subtotal_kobo)}</li>`).join("");
  const delivery = saved ? `${escapeHtml(saved.delivery_address)}, ${escapeHtml(saved.delivery_city)}, ${escapeHtml(saved.delivery_state)}` : "See your order details";
  const url = process.env.SITE_URL ?? "http://localhost:3000";
  const orderUrl = `${url.replace(/\/$/, "")}/account/orders/${order.id}`;
  const totals = `<p>Subtotal: ₦${money(saved?.subtotal_kobo ?? order.subtotal_kobo)}</p><p>Delivery: ₦${money(saved?.delivery_fee_kobo ?? order.delivery_fee_kobo)}</p><p><strong>Total: ₦${money(saved?.total_kobo ?? order.total_kobo)}</strong></p>`;
  const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(new Date(saved?.created_at ?? Date.now()));
  const customerHtml = `<div style="font-family:Arial,sans-serif;color:#282822;max-width:640px;margin:auto"><p style="letter-spacing:.16em">NESTORA</p><h1 style="font-family:Georgia,serif;font-weight:400">Your order is with us.</h1><p>Hello ${escapeHtml(details.customerName)},</p><p>Order ${escapeHtml(order.order_number)} · ${date}</p><ul>${itemHtml}</ul>${totals}<p>Delivering to: ${delivery}<br />${escapeHtml(details.customerPhone)}</p><p><a href="${escapeHtml(orderUrl)}">View your order</a></p><p>Thank you for choosing NESTORA.</p></div>`;
  const ownerHtml = `<div style="font-family:Arial,sans-serif;color:#282822;max-width:640px;margin:auto"><p style="letter-spacing:.16em">NESTORA</p><h1 style="font-family:Georgia,serif;font-weight:400">A new order has been placed.</h1><p>Order ${escapeHtml(order.order_number)} · ${date}</p><h2>Customer</h2><p>${escapeHtml(details.customerName)}<br />${escapeHtml(details.customerEmail)}<br />${escapeHtml(details.customerPhone)}</p><h2>Delivery</h2><p>${delivery}${details.notes ? `<br />Notes: ${escapeHtml(details.notes)}` : ""}</p><h2>Items</h2><ul>${itemHtml}</ul>${totals}</div>`;
  const recipients = [
    { type: "customer" as const, email: details.customerEmail.toLowerCase(), subject: `NESTORA order ${order.order_number}`, html: customerHtml },
    { type: "owner" as const, email: process.env.BUSINESS_OWNER_EMAIL ?? "", subject: `New NESTORA order — ${order.order_number}`, html: ownerHtml },
  ];
  let customerSent = false;
  for (const recipient of recipients) {
    let status: "sent" | "failed" = "sent"; let failure: string | null = null;
    try { if (!complete) throw new Error("order_email_data_unavailable"); await sendMail(recipient.email, recipient.subject, recipient.html); if (recipient.type === "customer") customerSent = true; }
    catch (error) { status = "failed"; failure = error instanceof Error ? error.message.slice(0, 500) : "resend_unknown_error"; console.error("Order email failed:", { recipientType: recipient.type, reason: failure }); }
    const { error } = await supabase.rpc("record_order_email_log", { p_order_id: order.id, p_recipient_type: recipient.type, p_recipient_email: recipient.email || "not-configured", p_status: status, p_error_message: failure });
    if (error) console.error("Order email result could not be logged:", error.message);
  }
  return customerSent;
}
