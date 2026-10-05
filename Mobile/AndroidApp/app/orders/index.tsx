import { useQuery } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Heading, Notice, Page } from "../../components/Screen";
import { supabase } from "../../lib/supabase";
import { keys } from "../../lib/query";
import { formatNaira } from "../../lib/format";
import { useTheme } from "../../lib/theme";
export default function Orders(){const t=useTheme();const q=useQuery({queryKey:keys.orders,queryFn:async()=>{if(!supabase)throw new Error();const{data,error}=await supabase.from("orders").select("id,order_number,status,total_kobo,created_at,order_items(quantity)").order("created_at",{ascending:false});if(error)throw error;return data??[];}});return <Page refreshing={q.isRefetching} onRefresh={() => { void q.refetch(); }}><Heading eyebrow="Your NESTORA orders">Order history</Heading>{q.isLoading?<Notice>Loading your orders…</Notice>:q.isError?<Notice error>Orders could not be loaded.</Notice>:!q.data?.length?<Notice>You haven’t placed an order yet.</Notice>:q.data.map((o:any)=><Pressable key={o.id} onPress={()=>router.push({pathname:"/orders/[orderId]",params:{orderId:o.id}})} style={{padding:16,backgroundColor:t.surface,borderWidth:1,borderColor:t.border,gap:7}}><Text style={{color:t.text,fontWeight:"600"}}>{o.order_number}</Text><Text style={{color:t.secondary}}>{new Date(o.created_at).toLocaleDateString("en-NG")} · {o.order_items?.reduce((n:number,i:any)=>n+i.quantity,0)??0} items</Text><View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={{color:t.accent}}>{o.status}</Text><Text style={{color:t.text}}>{formatNaira(o.total_kobo)}</Text></View></Pressable>)}</Page>;}
