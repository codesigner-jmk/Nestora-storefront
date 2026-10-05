import { supabase } from "../lib/supabase";
export async function addToCart(productId: string, variantId: string | null = null, quantity = 1) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.rpc("add_to_cart", { p_product_id: productId, p_variant_id: variantId, p_quantity: quantity });
  if (error) throw error;
}
export async function setQuantity(itemId: string, quantity: number) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.rpc("set_cart_quantity", { p_cart_item_id: itemId, p_quantity: quantity });
  if (error) throw error;
}
export async function removeItem(itemId: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.rpc("remove_cart_item", { p_cart_item_id: itemId });
  if (error) throw error;
}
