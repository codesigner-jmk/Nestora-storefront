import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Action, Heading, Notice, Page } from "../../components/Screen";
import { fetchCart } from "../../lib/data";
import { formatNaira } from "../../lib/format";
import { keys } from "../../lib/query";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../lib/theme";
import { removeItem, setQuantity } from "../../features/cart";
import { getRecentlyViewed } from "../../lib/recent";
export default function Cart() {
  const t = useTheme(); const qc = useQueryClient(); const q = useQuery({ queryKey: keys.cart, queryFn: fetchCart }); const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null);
  useEffect(() => {
    if (!supabase) { setRealtimeStatus("NOT_CONFIGURED"); return; }
    const client = supabase;
    const channel = client.channel("mobile-shared-cart")
      .on("postgres_changes", { event: "*", schema: "public", table: "carts" }, () => { void qc.invalidateQueries({ queryKey: keys.cart }); })
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, () => { void qc.invalidateQueries({ queryKey: keys.cart }); })
      .subscribe((status, error) => {
        setRealtimeStatus(status);
        if (status !== "SUBSCRIBED") console.warn("NESTORA cart Realtime status:", status, error?.message ?? "");
      });
    return () => { void client.removeChannel(channel); };
  }, [q.data?.cartId, qc]);
  const mutate = useMutation({ mutationFn: ({ id, qty }: { id: string; qty?: number }) => qty === undefined ? removeItem(id) : setQuantity(id, qty), onSuccess: () => qc.invalidateQueries({ queryKey: keys.cart }), onError: () => Alert.alert("Cart update failed", "Stock may have changed. Please refresh and try again.") });
  const items = q.data?.items ?? []; const subtotal = items.reduce((sum: number, item: any) => sum + (item.product?.price_kobo + (item.variant?.price_modifier_kobo ?? 0)) * item.quantity, 0);
  return <Page refreshing={q.isRefetching} onRefresh={() => { void Promise.all([q.refetch(), qc.invalidateQueries({ queryKey: ["recently-viewed"] })]); }}><Heading eyebrow="Your NESTORA cart">Take your time.</Heading>{realtimeStatus === "SUBSCRIBED" ? <Notice>Live cart updates are connected.</Notice> : realtimeStatus && ["CHANNEL_ERROR", "TIMED_OUT", "CLOSED", "NOT_CONFIGURED"].includes(realtimeStatus) ? <Notice error>Live cart sync is {realtimeStatus.toLowerCase().replaceAll("_", " ")}. Keep this screen open and check your connection.</Notice> : null}{q.isLoading ? <Notice>Loading your cart…</Notice> : q.isError ? <Notice error>We could not load your cart. Check your connection and try again.</Notice> : !items.length ? <View style={{ gap: 12, paddingVertical: 26 }}><Text style={{ color: t.text, fontFamily: "serif", fontSize: 20 }}>Your cart is empty.</Text><Notice>Pieces you add will be kept here while you decide.</Notice><Action label="Continue shopping" onPress={() => router.push("/(tabs)/shop")} /></View> : <>
    {items.map((item: any) => { const p=item.product; if (!p) return null; const image=[...(p.product_images??[])].sort((a:any,b:any)=>a.display_order-b.display_order)[0]; const unit=p.price_kobo+(item.variant?.price_modifier_kobo??0); return <View key={item.id} style={{ flexDirection:"row", gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:t.border }}>
      {image ? <Image source={{uri:image.image_url}} style={{width:82,height:96,backgroundColor:t.surfaceMuted}} resizeMode="cover"/> : <View style={{width:82,height:96,backgroundColor:t.surfaceMuted}}/>}<View style={{flex:1,gap:5}}><Link href={{pathname:"/shop/[slug]",params:{slug:p.slug}}} style={{color:t.text,fontSize:15}}>{p.name}</Link>{item.variant?<Text style={{color:t.secondary,fontSize:12}}>{item.variant.name}: {item.variant.value}</Text>:null}<Text style={{color:t.secondary}}>{formatNaira(unit)}</Text><View style={{flexDirection:"row",gap:16,alignItems:"center",marginTop:5}}><Pressable accessibilityLabel="Decrease quantity" onPress={()=>item.quantity>1?mutate.mutate({id:item.id,qty:item.quantity-1}):mutate.mutate({id:item.id})}><Text style={{color:t.accent,fontSize:18}}>−</Text></Pressable><Text style={{color:t.text}}>{item.quantity}</Text><Pressable accessibilityLabel="Increase quantity" onPress={()=>mutate.mutate({id:item.id,qty:item.quantity+1})}><Text style={{color:t.accent,fontSize:18}}>+</Text></Pressable><Pressable onPress={()=>mutate.mutate({id:item.id})}><Text style={{color:t.secondary,fontSize:12}}>Remove</Text></Pressable></View></View><Text style={{color:t.text,fontSize:12}}>{formatNaira(unit*item.quantity)}</Text></View>; })}
    <View style={{gap:10,backgroundColor:t.surface,padding:16,borderWidth:1,borderColor:t.border}}><Text style={{color:t.text}}>Subtotal       {formatNaira(subtotal)}</Text><Text style={{color:t.secondary}}>Delivery       {q.data?.deliveryFee==null?"To be configured":formatNaira(q.data.deliveryFee)}</Text><Text style={{color:t.text,fontWeight:"700"}}>Total             {q.data?.deliveryFee==null?"—":formatNaira(subtotal+q.data.deliveryFee)}</Text></View><Action label="Continue shopping" secondary onPress={()=>router.push("/(tabs)/shop")}/>{q.data?.deliveryFee==null?<Notice>Checkout will open once delivery pricing is configured.</Notice>:<Action label="Continue to checkout" onPress={()=>router.push("/checkout")}/>}
    </>}<RecentlyViewed cartItems={items}/></Page>;
}

function RecentlyViewed({cartItems}:{cartItems:any[]}){
  const t=useTheme();const excluded=cartItems.map((item:any)=>item.product_id);const q=useQuery({queryKey:["recently-viewed",...excluded],queryFn:()=>getRecentlyViewed(excluded)});
  if(!q.data?.length)return null;
  return <View style={{gap:12,marginTop:10}}><Text style={{color:t.text,fontFamily:"serif",fontSize:21}}>Recently viewed</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12}}>{q.data.map((p:any)=>{const image=[...(p.product_images??[])].sort((a:any,b:any)=>a.display_order-b.display_order)[0];return <Link key={p.id} href={{pathname:"/shop/[slug]",params:{slug:p.slug}}} style={{width:140}}>{image?<Image source={{uri:image.image_url}} style={{width:140,height:120,backgroundColor:t.surfaceMuted}} resizeMode="cover"/>:null}<Text numberOfLines={2} style={{color:t.text,marginTop:6}}>{p.name}</Text><Text style={{color:t.secondary,fontSize:12,marginTop:3}}>{formatNaira(p.price_kobo)}</Text></Link>;})}</ScrollView></View>;
}
