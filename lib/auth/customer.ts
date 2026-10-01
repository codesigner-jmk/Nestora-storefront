import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireCustomer(next = "/account") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/login?error=setup&next=${encodeURIComponent(next)}`);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { supabase, user };
}
