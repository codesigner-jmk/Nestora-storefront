"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254),
  customerPhone: z.string().trim().min(7).max(30),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(500).optional(),
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

async function sendMail(to: string, subject: string, html: string) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;
  if (!apiKey || !domain || !from || !to) throw new Error("mail_configuration_missing");
  const body = new URLSearchParams({ from, to, subject, html });
  const apiBase = process.env.MAILGUN_API_BASE_URL ?? "https://api.mailgun.net";
  const response = await fetch(`${apiBase}/v3/${encodeURIComponent(domain)}/messages`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("mail_delivery_failed");
}

export async function createOrder(formData: FormData) {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/checkout?error=details");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=setup&next=%2Fcheckout");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login?next=%2Fcheckout");

  const { data, error } = await supabase.rpc("create_order_from_cart", {
    p_customer_name: parsed.data.customerName,
    p_customer_email: parsed.data.customerEmail.toLowerCase(),
    p_customer_phone: parsed.data.customerPhone,
    p_delivery_address: parsed.data.address,
    p_delivery_city: parsed.data.city,
    p_delivery_state: parsed.data.state,
    p_delivery_notes: parsed.data.notes ?? "",
  });
  if (error) {
    console.error("Order creation failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const reason = error.message.includes("delivery_fee_not_configured") ? "delivery" : error.message.includes("empty_cart") ? "empty" : error.message.includes("insufficient_stock") || error.message.includes("product_unavailable") || error.message.includes("variant_unavailable") ? "stock" : "place";
    redirect(`/checkout?error=${reason}`);
  }
  const order = Array.isArray(data) ? data[0] : data;
  if (!order?.id || !order.order_number) redirect("/checkout?error=place");

  const { data: lines, error: linesError } = await supabase.from("order_items").select("product_name,variant_name,quantity,product_price_kobo,subtotal_kobo").eq("order_id", order.id);
  const items = linesError ? [] : lines ?? [];
  const { data: orderDetails } = await supabase.from("orders").select("subtotal_kobo,delivery_fee_kobo,total_kobo,delivery_address,delivery_city,delivery_state,delivery_notes,created_at").eq("id", order.id).eq("user_id", user.id).maybeSingle();
  const itemHtml = items.map((item) => `<li>${escapeHtml(item.product_name)}${item.variant_name ? ` (${escapeHtml(item.variant_name)})` : ""} × ${item.quantity} — ₦${(item.subtotal_kobo / 100).toLocaleString("en-NG")}</li>`).join("");
  const delivery = orderDetails ? `${escapeHtml(orderDetails.delivery_address)}, ${escapeHtml(orderDetails.delivery_city)}, ${escapeHtml(orderDetails.delivery_state)}` : "See your order details";
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const orderUrl = `${siteUrl.replace(/\/$/, "")}/account/orders/${order.id}`;
  const totalBlock = `<p>Subtotal: ₦${((orderDetails?.subtotal_kobo ?? order.subtotal_kobo) / 100).toLocaleString("en-NG")}</p><p>Delivery: ₦${((orderDetails?.delivery_fee_kobo ?? order.delivery_fee_kobo) / 100).toLocaleString("en-NG")}</p><p><strong>Total: ₦${((orderDetails?.total_kobo ?? order.total_kobo) / 100).toLocaleString("en-NG")}</strong></p>`;
  const orderDate = new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(new Date(orderDetails?.created_at ?? Date.now()));
  const customerHtml = `<div style="font-family:Arial,sans-serif;color:#282822;max-width:640px;margin:auto"><p style="letter-spacing:.16em">NESTORA</p><h1 style="font-family:Georgia,serif;font-weight:400">Your order is with us.</h1><p>Hello ${escapeHtml(parsed.data.customerName)},</p><p>Order ${escapeHtml(order.order_number)} · ${orderDate}</p><ul>${itemHtml}</ul>${totalBlock}<p>Delivering to: ${delivery}<br />${escapeHtml(parsed.data.customerPhone)}</p><p><a href="${escapeHtml(orderUrl)}">View your order</a></p><p>Thank you for choosing NESTORA.</p></div>`;
  const ownerHtml = `<div style="font-family:Arial,sans-serif;color:#282822;max-width:640px;margin:auto"><p style="letter-spacing:.16em">NESTORA</p><h1 style="font-family:Georgia,serif;font-weight:400">A new order has been placed.</h1><p>Order ${escapeHtml(order.order_number)} · ${orderDate}</p><h2>Customer</h2><p>${escapeHtml(parsed.data.customerName)}<br />${escapeHtml(parsed.data.customerEmail)}<br />${escapeHtml(parsed.data.customerPhone)}</p><h2>Delivery</h2><p>${delivery}${parsed.data.notes ? `<br />Notes: ${escapeHtml(parsed.data.notes)}` : ""}</p><h2>Items</h2><ul>${itemHtml}</ul>${totalBlock}</div>`;
  const recipients = [
    { type: "customer" as const, email: parsed.data.customerEmail.toLowerCase(), subject: `NESTORA order ${order.order_number}` },
    { type: "owner" as const, email: process.env.BUSINESS_OWNER_EMAIL ?? "", subject: `New NESTORA order — ${order.order_number}` },
  ];
  let customerEmailSent = false;
  for (const recipient of recipients) {
    let status: "sent" | "failed" = "sent";
    let failure: string | null = null;
    try {
      if (linesError || !orderDetails) throw new Error("order_email_data_unavailable");
      await sendMail(recipient.email, recipient.subject, recipient.type === "customer" ? customerHtml : ownerHtml);
      if (recipient.type === "customer") customerEmailSent = true;
    } catch {
      status = "failed";
      failure = "Delivery failed or Mailgun configuration is incomplete.";
    }
    const { error: logError } = await supabase.rpc("record_order_email_log", {
      p_order_id: order.id, p_recipient_type: recipient.type, p_recipient_email: recipient.email || "not-configured", p_status: status, p_error_message: failure,
    });
    if (logError) console.error("Order email result could not be logged:", logError.message);
  }
  redirect(`/account/orders/${order.id}?email=${customerEmailSent ? "sent" : "failed"}`);
}
