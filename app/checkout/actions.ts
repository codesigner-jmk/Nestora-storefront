"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmails } from "@/lib/orders/confirmation";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254),
  customerPhone: z.string().trim().min(7).max(30),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(500).optional(),
});

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

  const customerEmailSent = await sendOrderConfirmationEmails(supabase, user.id, order, parsed.data);
  redirect(`/account/orders/${order.id}?email=${customerEmailSent ? "sent" : "failed"}`);
}
