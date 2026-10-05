import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Heading, Notice, Page, ProductGrid } from "../../components/Screen";
import { fetchCategories, fetchProducts } from "../../lib/data";
import { keys } from "../../lib/query";
import { useTheme } from "../../lib/theme";
import { useLocalSearchParams } from "expo-router";
export default function Shop() {
  const t = useTheme(); const params = useLocalSearchParams<{ category?: string }>(); const [search, setSearch] = useState(""); const [sort,setSort]=useState("newest"); const [category,setCategory]=useState(params.category??"");
  useEffect(()=>{setCategory(params.category??"");},[params.category]);
  const categories=useQuery({queryKey:keys.categories,queryFn:fetchCategories});
  const query = useQuery({ queryKey: [...keys.products, search, category,sort], queryFn: () => fetchProducts({ search, category:category||undefined,sort }) });
  const chip=(label:string,value:string)=> <Pressable key={value} onPress={()=>setSort(value)} style={{padding:10,borderWidth:1,borderColor:sort===value?t.accent:t.border,backgroundColor:sort===value?t.accentSurface:t.surface}}><Text style={{color:t.text,fontSize:12}}>{label}</Text></Pressable>;
  return <Page refreshing={query.isRefetching || categories.isRefetching} onRefresh={() => { void Promise.all([query.refetch(), categories.refetch()]); }}><Heading eyebrow="NESTORA collection">Shop furniture</Heading><TextInput value={search} onChangeText={setSearch} placeholder="Search furniture" placeholderTextColor={t.secondary} accessibilityLabel="Search furniture" style={{ color: t.text, backgroundColor: t.surface, borderColor: t.border, borderWidth: 1, padding: 14, fontSize: 15 }} /><View style={{gap:8}}><Text style={{color:t.text,fontWeight:"600"}}>Categories</Text><View style={{flexDirection:"row",flexWrap:"wrap",gap:7}}><Pressable onPress={()=>setCategory("")} style={{padding:10,borderWidth:1,borderColor:!category?t.accent:t.border,backgroundColor:!category?t.accentSurface:t.surface}}><Text style={{color:t.text,fontSize:12}}>All</Text></Pressable>{(categories.data??[]).map((c:any)=><Pressable key={c.id} onPress={()=>setCategory(c.id)} style={{padding:10,borderWidth:1,borderColor:category===c.id?t.accent:t.border,backgroundColor:category===c.id?t.accentSurface:t.surface}}><Text style={{color:t.text,fontSize:12}}>{c.name}</Text></Pressable>)}</View></View><View style={{flexDirection:"row",gap:7}}>{chip("Latest","newest")}{chip("Price: low to high","price_asc")}{chip("Price: high to low","price_desc")}</View>{query.isLoading ? <Notice>Finding pieces for your home…</Notice> : query.isError ? <Notice error>We could not load products. Please try again.</Notice> : query.data?.length ? <ProductGrid products={query.data} /> : <View style={{ paddingVertical: 30 }}><Notice>No products match your search.</Notice></View>}</Page>;
}
