import { supabase } from "./supabase";

export const productSelect = "id,name,slug,description,price_kobo,stock_quantity,sku,is_active,is_featured,is_best_seller,category:categories(name,slug),product_images(id,image_url,alt_text,display_order),product_variants(id,name,value,price_modifier_kobo,stock_quantity,sku)";

export async function fetchProducts(options: { search?: string; category?: string; bestSeller?: boolean; featured?: boolean; sort?: string } = {}) {
  if (!supabase) throw new Error("Supabase is not configured.");
  let query = supabase.from("products").select(productSelect).eq("is_active", true);
  if (options.search?.trim()) { const term = options.search.trim().slice(0, 80).replace(/[,%()]/g, " "); query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%`); }
  if (options.category) query = query.eq("category_id", options.category);
  if (options.bestSeller) query = query.eq("is_best_seller", true);
  if (options.featured) query = query.eq("is_featured", true);
  if (options.sort === "price_asc") query = query.order("price_kobo", { ascending: true });
  else if (options.sort === "price_desc") query = query.order("price_kobo", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategories() {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.from("categories").select("id,name,slug,image_url").eq("is_active", true).order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchProduct(slug: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.from("products").select(productSelect).eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCart() {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { cartId: null, items: [], deliveryFee: null };
  const { data: cart, error: cartError } = await supabase.from("carts").select("id").eq("user_id", auth.user.id).maybeSingle();
  if (cartError) throw cartError;
  if (!cart) return { cartId: null, items: [], deliveryFee: null };
  const [{ data: items, error }, { data: settings }] = await Promise.all([
    supabase.from("cart_items").select(`id,cart_id,quantity,product_id,variant_id,product:products(${productSelect}),variant:product_variants(id,name,value,price_modifier_kobo,stock_quantity)`).eq("cart_id", cart.id),
    supabase.from("store_settings").select("standard_delivery_fee_kobo").eq("id", true).maybeSingle(),
  ]);
  if (error) throw error;
  return { cartId: cart.id, items: items ?? [], deliveryFee: settings?.standard_delivery_fee_kobo ?? null };
}

export async function fetchWishlist() {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data: list, error: listError } = await supabase.from("wishlists").select("id").eq("user_id", auth.user.id).maybeSingle();
  if (listError) throw listError;
  if (!list) return [];
  const { data, error } = await supabase.from("wishlist_items").select(`id,product_id,product:products(${productSelect})`).eq("wishlist_id", list.id);
  if (error) throw error;
  return data ?? [];
}
