"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());

export async function subscribeToNewsletter(formData: FormData) {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) redirect("/?newsletter=invalid#newsletter");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/?newsletter=setup#newsletter");
  const { error } = await supabase.from("newsletter_subscribers").upsert({ email: parsed.data }, { onConflict: "email", ignoreDuplicates: true });
  if (error) {
    console.error("Newsletter subscription failed:", error.message);
    redirect("/?newsletter=error#newsletter");
  }
  redirect("/?newsletter=success#newsletter");
}
