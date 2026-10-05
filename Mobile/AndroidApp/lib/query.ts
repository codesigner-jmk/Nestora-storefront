import { QueryClient } from "@tanstack/react-query";
export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } });
export const keys = {
  products: ["products"] as const, categories: ["categories"] as const,
  product: (slug: string) => ["product", slug] as const,
  cart: ["cart"] as const, wishlist: ["wishlist"] as const,
  orders: ["orders"] as const, profile: ["profile"] as const,
};
