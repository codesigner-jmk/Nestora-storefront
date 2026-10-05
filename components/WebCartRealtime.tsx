"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createBrowserClient(supabaseUrl, supabaseKey) : null;
export function WebCartRealtime() {
  const router = useRouter();
  useEffect(() => {
    if (!supabase) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session) return;
      channel = supabase.channel(`web-cart-${session.user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "carts" }, () => router.refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, () => router.refresh())
        .subscribe((status, error) => {
          if (status !== "SUBSCRIBED") console.warn("NESTORA cart Realtime status:", status, error?.message ?? "");
        });
    });
    return () => { cancelled = true; if (channel) void supabase.removeChannel(channel); };
  }, [router]);
  return null;
}
