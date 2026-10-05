import { supabase } from "../lib/supabase";
export async function toggleWishlist(productId: string, alreadySaved: boolean) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sign in to save products.");
  let { data: list, error } = await supabase.from("wishlists").select("id").eq("user_id", auth.user.id).maybeSingle();
  if (error) throw error;
  if (!list && !alreadySaved) {
    const result = await supabase.from("wishlists").insert({ user_id: auth.user.id }).select("id").single();
    if (result.error) throw result.error;
    list = result.data;
  }
  if (!list) return;
  const mutation = alreadySaved
    ? await supabase.from("wishlist_items").delete().eq("wishlist_id", list.id).eq("product_id", productId)
    : await supabase.from("wishlist_items").insert({ wishlist_id: list.id, product_id: productId });
  if (mutation.error) throw mutation.error;
}
