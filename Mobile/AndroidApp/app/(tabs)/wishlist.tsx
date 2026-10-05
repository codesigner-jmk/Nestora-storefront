import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Text, View } from "react-native";
import { Heading, Notice, Page, ProductGrid } from "../../components/Screen";
import { fetchWishlist } from "../../lib/data";
import { keys } from "../../lib/query";
import { toggleWishlist } from "../../features/wishlist";
import { useTheme } from "../../lib/theme";
export default function Wishlist() {
  const t = useTheme(); const qc = useQueryClient(); const q = useQuery({ queryKey: keys.wishlist, queryFn: fetchWishlist });
  const remove = useMutation({ mutationFn: (id: string) => toggleWishlist(id, true), onSuccess: () => qc.invalidateQueries({ queryKey: keys.wishlist }), onError: () => Alert.alert("Could not update wishlist", "Please try again.") });
  const products = (q.data ?? []).map((x: any) => x.product).filter(Boolean);
  return <Page refreshing={q.isRefetching} onRefresh={() => { void q.refetch(); }}><Heading eyebrow="Saved for later">Your wishlist</Heading>{q.isLoading ? <Notice>Loading your saved pieces…</Notice> : q.isError ? <Notice error>We could not load your wishlist.</Notice> : products.length ? <><Notice>Tap a piece to see its details. Remove saved items from their product page.</Notice><ProductGrid products={products} /></> : <View style={{ paddingVertical: 28, gap: 10 }}><Text style={{ color: t.text, fontFamily: "serif", fontSize: 20 }}>Your wishlist is empty.</Text><Notice>Save pieces you love and come back to them later.</Notice></View>}</Page>;
}
