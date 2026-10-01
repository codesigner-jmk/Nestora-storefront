"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safePath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/account";
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=setup");
  const next = safePath(String(formData.get("next") ?? "/account"));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const callbackUrl = new URL("/auth/callback", siteUrl);
  callbackUrl.searchParams.set("next", next);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString(), queryParams: { access_type: "offline", prompt: "consent" } },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
