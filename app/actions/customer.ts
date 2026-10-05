"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth/customer";

const cartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1),
  returnTo: z.string().startsWith("/").default("/cart"),
});

export async function addToCart(formData: FormData) {
  const parsed = cartSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/cart?error=invalid");
  const { supabase } = await requireCustomer(parsed.data.returnTo);
  const { error } = await supabase.rpc("add_to_cart", { p_product_id: parsed.data.productId, p_variant_id: parsed.data.variantId || null, p_quantity: parsed.data.quantity });
  if (error) {
    const reason = error.message.includes("insufficient_stock") ? "stock" : error.message.includes("unavailable") ? "unavailable" : "save";
    redirect(`${parsed.data.returnTo}?error=${reason}`);
  }
  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect("/cart?updated=1");
}

const itemSchema = z.string().uuid();

export async function removeCartItem(formData: FormData) {
  const itemId = itemSchema.safeParse(formData.get("itemId"));
  if (!itemId.success) redirect("/cart?error=invalid");
  const { supabase } = await requireCustomer("/cart");
  const { error } = await supabase.rpc("remove_cart_item", { p_cart_item_id: itemId.data });
  if (error) {
    console.error("Cart item removal failed:", error.message);
    redirect("/cart?error=save");
  }
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function setCartQuantity(formData: FormData) {
  const parsed = z.object({ itemId: z.string().uuid(), quantity: z.coerce.number().int().min(1) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/cart?error=invalid");
  const { supabase } = await requireCustomer("/cart");
  const { error } = await supabase.rpc("set_cart_quantity", { p_cart_item_id: parsed.data.itemId, p_quantity: parsed.data.quantity });
  if (error) {
    const reason = error.message.includes("insufficient_stock") ? "stock" : error.message.includes("unavailable") ? "unavailable" : "save";
    redirect(`/cart?error=${reason}`);
  }
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

type WishlistActionState = { status: "idle" | "success" | "error"; message: string };

export async function addToWishlist(_previousState: WishlistActionState, formData: FormData): Promise<WishlistActionState> {
  const productId = z.string().uuid().safeParse(formData.get("productId"));
  if (!productId.success) return { status: "error", message: "We couldn’t save this piece. Please try again." };
  const rawReturnTo = formData.get("returnTo");
  const returnTo = typeof rawReturnTo === "string" && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "/wishlist";
  const { supabase, user } = await requireCustomer(returnTo);
  const { data: product } = await supabase.from("products").select("id,is_active").eq("id", productId.data).maybeSingle();
  if (!product?.is_active) return { status: "error", message: "This piece is no longer available to save." };
  const { data: wishlist, error: wishlistError } = await supabase.from("wishlists").upsert({ user_id: user.id }, { onConflict: "user_id" }).select("id").single();
  if (wishlistError || !wishlist) return { status: "error", message: "We couldn’t save this piece. Please try again." };
  const { error } = await supabase.from("wishlist_items").upsert({ wishlist_id: wishlist.id, product_id: product.id }, { onConflict: "wishlist_id,product_id", ignoreDuplicates: true });
  if (error) {
    console.error("Wishlist update failed:", error.message);
    return { status: "error", message: "We couldn’t save this piece. Please try again." };
  }
  revalidatePath("/wishlist");
  return { status: "success", message: "Added to your wishlist." };
}

export async function removeWishlistItem(formData: FormData) {
  const itemId = itemSchema.safeParse(formData.get("itemId"));
  if (!itemId.success) redirect("/wishlist?error=invalid");
  const { supabase } = await requireCustomer("/wishlist");
  const { error } = await supabase.from("wishlist_items").delete().eq("id", itemId.data);
  if (error) {
    console.error("Wishlist item removal failed:", error.message);
    redirect("/wishlist?error=save");
  }
  revalidatePath("/wishlist");
}

export async function signOut() {
  const { supabase } = await requireCustomer("/account");
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out failed:", error.message);
  redirect("/");
}
