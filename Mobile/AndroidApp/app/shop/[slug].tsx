import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, ToastAndroid, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Action, Heading, Loading, Notice, Page } from "../../components/Screen";
import { fetchProduct } from "../../lib/data";
import { formatNaira } from "../../lib/format";
import { keys } from "../../lib/query";
import { useTheme } from "../../lib/theme";
import { addToCart } from "../../features/cart";
import { toggleWishlist } from "../../features/wishlist";
import { recordRecentlyViewed } from "../../lib/recent";
export default function ProductDetail() {
  const t = useTheme(); const { width: screenWidth } = useWindowDimensions(); const { slug } = useLocalSearchParams<{ slug: string }>(); const qc = useQueryClient(); const [variant, setVariant] = useState<string | null>(null); const [quantity,setQuantity]=useState(1);
  const product = useQuery({ queryKey: keys.product(slug), queryFn: () => fetchProduct(slug), enabled: Boolean(slug) });
  const saved = useQuery({ queryKey: keys.wishlist, queryFn: async () => { const { fetchWishlist } = await import("../../lib/data"); return fetchWishlist(); } });
  useEffect(() => { if(product.data?.id) void recordRecentlyViewed(product.data.id); }, [product.data?.id]);
  const cart = useMutation({ mutationFn: () => addToCart(product.data!.id, variant), onSuccess: async () => { await qc.invalidateQueries({ queryKey: keys.cart }); ToastAndroid.show("Added to cart", ToastAndroid.SHORT); }, onError: () => Alert.alert("Could not add this item", "Availability may have changed. Please try again.") });
  const wishlist = useMutation({ mutationFn: () => toggleWishlist(product.data!.id, (saved.data ?? []).some((x: any) => x.product_id === product.data!.id)), onSuccess: async () => { const removing=(saved.data??[]).some((x:any)=>x.product_id===product.data!.id); await qc.invalidateQueries({ queryKey: keys.wishlist }); Alert.alert(removing?"Removed from wishlist":"Saved to wishlist"); }, onError: () => Alert.alert("Could not update wishlist", "Please try again.") });
  if (product.isLoading) return <Loading />;
  if (product.isError || !product.data) return <Page refreshing={product.isRefetching} onRefresh={() => { void product.refetch(); }}><Notice error>This product is unavailable right now.</Notice></Page>;
  const p = product.data; const images = [...(p.product_images ?? [])].sort((a: any,b: any)=>a.display_order-b.display_order); const variants = p.product_variants ?? []; const chosen = variants.find((v: any)=>v.id===variant); const availableStock=variants.length?(chosen?.stock_quantity??0):p.stock_quantity; const available = availableStock > 0;
  const galleryHeight = Math.min(430, Math.max(300, screenWidth * 1.02));
  return <Page refreshing={product.isRefetching || saved.isRefetching} onRefresh={() => { void Promise.all([product.refetch(), saved.refetch()]); }}><ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ alignItems: "center" }}>{images.length ? images.map((im: any)=><Image key={im.id} source={{ uri: im.image_url }} accessibilityLabel={im.alt_text || p.name} style={{ width: screenWidth, height: galleryHeight, backgroundColor: t.surfaceMuted }} resizeMode="cover" />) : <View style={{ width: screenWidth, height: galleryHeight, backgroundColor: t.surfaceMuted }} />}</ScrollView><Heading eyebrow={p.category?.[0]?.name}>{p.name}</Heading><Text style={{ color: t.text, fontSize: 18 }}>{formatNaira(p.price_kobo + (chosen?.price_modifier_kobo ?? 0))}</Text><Notice>{variants.length&&!chosen?"Choose an available option":available ? "Available to order" : "Currently unavailable"}</Notice><Notice>{p.description}</Notice>
    {variants.length ? <View style={{ gap: 10 }}><Text style={{ color: t.text, fontWeight: "600" }}>Choose an option</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{variants.map((v: any)=><Pressable key={v.id} onPress={()=>{setVariant(v.id);setQuantity(1);}} style={{ borderWidth: 1, borderColor: variant===v.id?t.accent:t.border, padding: 12, opacity: v.stock_quantity ? 1 : .45 }}><Text style={{ color: t.text }}>{v.name}: {v.value}{v.stock_quantity===0?" · unavailable":""}</Text></Pressable>)}</View></View> : null}
    <View style={{flexDirection:"row",alignItems:"center",gap:18}}><Text style={{color:t.text}}>Quantity</Text><Pressable accessibilityLabel="Decrease quantity" onPress={()=>setQuantity(Math.max(1,quantity-1))}><Text style={{color:t.accent,fontSize:20}}>−</Text></Pressable><Text style={{color:t.text}}>{quantity}</Text><Pressable accessibilityLabel="Increase quantity" onPress={()=>setQuantity(Math.min(availableStock||1,quantity+1))}><Text style={{color:t.accent,fontSize:20}}>+</Text></Pressable></View>
    <Pressable onPress={()=>{if(!saved.isLoading&&!wishlist.isPending)wishlist.mutate();}} style={{ minHeight: 48, justifyContent: "center" }}><Text style={{ color: t.accent }}>{(saved.data ?? []).some((x: any)=>x.product_id===p.id) ? "♥  Saved to wishlist" : "♡  Save to wishlist"}</Text></Pressable><Action label={cart.isPending?"Adding…":"Add to cart"} disabled={cart.isPending} onPress={()=>{if(variants.length&&!variant){Alert.alert("Choose an option","Select an available product option first.");return;}if(!available){Alert.alert("Unavailable","This product is currently unavailable.");return;}cart.mutate();}} />
    <Pressable onPress={()=>router.back()}><Text style={{ color: t.secondary, textAlign: "center", padding: 12 }}>Back to shopping</Text></Pressable></Page>;
}
