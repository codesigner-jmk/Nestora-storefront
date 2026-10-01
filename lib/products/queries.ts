import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Product } from "./types";

const productSelection = `id,name,slug,description,price_kobo,stock_quantity,sku,is_active,is_featured,is_best_seller,category:categories(name,slug),product_images(image_url,alt_text,display_order),product_variants(id,name,value,price_modifier_kobo,stock_quantity,sku)`;

export async function getProducts(options: {
  search?: string;
  category?: string;
  sort?: string;
  bestSellers?: boolean;
  featured?: boolean;
  minPriceKobo?: number;
  maxPriceKobo?: number;
  inStock?: boolean;
  limit?: number;
} = {}): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase.from("products").select(productSelection).eq("is_active", true);
  if (options.search?.trim()) {
    const term = options.search.trim().replace(/[,%()]/g, " ");
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%`);
  }
  if (options.category) query = query.eq("category_id", options.category);
  if (options.bestSellers) query = query.eq("is_best_seller", true);
  if (options.featured) query = query.eq("is_featured", true);
  if (options.minPriceKobo !== undefined) query = query.gte("price_kobo", options.minPriceKobo);
  if (options.maxPriceKobo !== undefined) query = query.lte("price_kobo", options.maxPriceKobo);
  if (options.sort === "featured") query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  else if (options.sort === "best_selling") query = query.order("is_best_seller", { ascending: false }).order("created_at", { ascending: false });
  else if (options.sort === "price_asc") query = query.order("price_kobo", { ascending: true });
  else if (options.sort === "price_desc") query = query.order("price_kobo", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("Product query failed:", error.message);
    return [];
  }
  const products = (data ?? []) as unknown as Product[];
  return options.inStock ? products.filter((product) => product.stock_quantity > 0 || (product.product_variants ?? []).some((variant) => variant.stock_quantity > 0)) : products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(productSelection)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) {
    console.error("Product query failed:", error.message);
    return null;
  }
  return data as unknown as Product | null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,image_url")
    .eq("is_active", true)
    .order("name");
  if (error) {
    console.error("Category query failed:", error.message);
    return [];
  }
  return data ?? [];
}
