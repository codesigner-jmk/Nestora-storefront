import { supabase } from "./supabase";
import { productSelect } from "./data";
import { queryClient } from "./query";
const key = "nestora.recent-products.v1";
export async function recordRecentlyViewed(id: string) {
  try {
    const stored = localStorage.getItem(key);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem(key, JSON.stringify([id, ...ids.filter((value) => value !== id)].slice(0, 4)));
    await queryClient.invalidateQueries({ queryKey: ["recently-viewed"] });
  } catch { /* Local discovery history is optional. */ }
}
export async function getRecentlyViewed(excludedIds: string[]) {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const selected = ids.filter((id) => !excludedIds.includes(id));
    if (!supabase || !selected.length) return [];
    const { data, error } = await supabase.from("products").select(productSelect).in("id", selected).eq("is_active", true);
    if (error) throw error;
    const byId = new Map((data ?? []).map((product) => [product.id, product]));
    return selected.flatMap((id) => byId.has(id) ? [byId.get(id)!] : []);
  } catch { return []; }
}
