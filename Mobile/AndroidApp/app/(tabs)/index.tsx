import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Heading, Notice, Page, ProductGrid } from "../../components/Screen";
import { fetchCategories, fetchProducts } from "../../lib/data";
import { keys } from "../../lib/query";
import { useTheme } from "../../lib/theme";

const promoCards = [
  { slug: "sofas", eyebrow: "Living room", title: "Room to\nsettle in.", action: "Explore the collection", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85", alt: "Soft neutral sofa in a considered living room" },
  { slug: "beds", eyebrow: "Bedroom essentials", title: "Restful.\nSimply yours.", action: "Find your quiet", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85", alt: "A calm bedroom with natural wood and soft linens" },
];

export default function Home() {
  const t = useTheme();
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const rawSearch = search.trim();

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(rawSearch), 250);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  const categories = useQuery({ queryKey: keys.categories, queryFn: fetchCategories });
  const best = useQuery({ queryKey: [...keys.products, "best"], queryFn: () => fetchProducts({ bestSeller: true }) });
  const featured = useQuery({ queryKey: [...keys.products, "featured"], queryFn: () => fetchProducts({ featured: true }) });
  const searchMode = Boolean(rawSearch || category || sort !== "newest");
  const searchResults = useQuery({
    queryKey: ["home-search", searchTerm, category, sort],
    queryFn: () => fetchProducts({ search: searchTerm, category: category || undefined, sort }),
    enabled: searchMode && searchTerm === rawSearch,
  });
  const refreshing = categories.isRefetching || best.isRefetching || featured.isRefetching || searchResults.isRefetching;
  const refresh = () => { void Promise.all([categories.refetch(), best.refetch(), featured.refetch(), ...(searchMode ? [searchResults.refetch()] : [])]); };
  const hero = best.data?.[0]?.product_images?.[0]?.image_url ?? "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=88";
  const chip = (label: string, selected: boolean, onPress: () => void) => <Pressable key={label} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} style={{ paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: selected ? t.accent : t.border, backgroundColor: selected ? t.accentSurface : t.surface }}><Text style={{ color: t.text, fontSize: 12 }}>{label}</Text></Pressable>;

  return <Page refreshing={refreshing} onRefresh={refresh}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: t.text, fontFamily: "serif", fontSize: 18, letterSpacing: 3 }}>NESTORA</Text>
      <Pressable onPress={() => Alert.alert("Notifications", "Notifications are not available yet.")} accessibilityRole="button" accessibilityLabel="Notifications" style={{ width: 42, height: 42, alignItems: "center", justifyContent: "center" }}><Feather name="bell" size={19} color={t.secondary} /></Pressable>
    </View>

    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ flex: 1, height: 50, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 13, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
        <Feather name="search" size={18} color={t.secondary} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search furniture" placeholderTextColor={t.secondary} accessibilityLabel="Search furniture" returnKeyType="search" autoCapitalize="none" style={{ flex: 1, color: t.text, fontSize: 14, paddingVertical: 8 }} />
        {search ? <Pressable onPress={() => setSearch("")} accessibilityRole="button" accessibilityLabel="Clear search"><Feather name="x" size={18} color={t.secondary} /></Pressable> : null}
      </View>
      <Pressable onPress={() => setFilterOpen((open) => !open)} accessibilityRole="button" accessibilityLabel="Filter products" accessibilityState={{ expanded: filterOpen }} style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: filterOpen ? t.accent : t.border, backgroundColor: filterOpen ? t.accentSurface : t.surface }}><Feather name="sliders" size={19} color={t.accent} /></Pressable>
    </View>

    {filterOpen ? <View style={{ gap: 11, padding: 14, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
      <View style={{ gap: 8 }}><Text style={{ color: t.text, fontSize: 13, fontWeight: "600" }}>Category</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>{chip("All", !category, () => setCategory(""))}{(categories.data ?? []).map((item: any) => chip(item.name, category === item.id, () => setCategory(category === item.id ? "" : item.id)))}</ScrollView></View>
      <View style={{ gap: 8 }}><Text style={{ color: t.text, fontSize: 13, fontWeight: "600" }}>Sort by</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>{chip("Latest", sort === "newest", () => setSort("newest"))}{chip("Price: low to high", sort === "price_asc", () => setSort("price_asc"))}{chip("Price: high to low", sort === "price_desc", () => setSort("price_desc"))}</View></View>
    </View> : null}

    {searchMode ? <View style={{ gap: 14 }}>
      <Heading eyebrow="Search NESTORA">{rawSearch ? `Results for “${rawSearch}”` : "Find your piece."}</Heading>
      {searchTerm !== rawSearch ? <View style={{ alignItems: "center", padding: 20 }}><ActivityIndicator color={t.accent} /></View> : searchResults.isLoading ? <View style={{ alignItems: "center", padding: 20 }}><ActivityIndicator color={t.accent} /></View> : searchResults.isError ? <Notice error>We could not search the catalogue. Pull down to try again.</Notice> : searchResults.data?.length ? <ProductGrid products={searchResults.data} /> : <Notice>No products match those choices.</Notice>}
    </View> : <>
      <View style={{ backgroundColor: t.accentSurface, paddingVertical: 12, paddingHorizontal: 14 }}><Text style={{ color: t.accent, fontSize: 12 }}>Thoughtful pieces for living well</Text></View>

      <View style={{ flexDirection: "row", gap: 9 }}>
        <TrustCard icon="truck" title="Delivery guarantee" description="Refund for any issue" />
        <TrustCard icon="tag" title="Clear pricing" description="See each price before you order" />
      </View>

      <View style={{ height: 320, backgroundColor: t.surfaceMuted, justifyContent: "flex-end", overflow: "hidden" }}>
        <Image source={{ uri: hero }} accessibilityLabel="Warm contemporary NESTORA living room" style={{ position: "absolute", width: "100%", height: "100%" }} resizeMode="cover" />
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(22, 23, 19, 0.34)" }} />
        <View style={{ padding: 21, gap: 9 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 10, letterSpacing: 2 }}>THE NESTORA COLLECTION</Text>
          <Text style={{ color: "#FFFFFF", fontFamily: "serif", fontSize: 30, lineHeight: 36 }}>Make room for living.</Text>
          <Text style={{ color: "#F3F0E9", fontSize: 14, lineHeight: 20 }}>Furniture with a place in your everyday.</Text>
          <Pressable onPress={() => router.push("/(tabs)/shop")} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 5 }}><Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Explore the collection</Text><Feather name="arrow-right" size={16} color="#FFFFFF" /></Pressable>
        </View>
      </View>

      <View style={{ gap: 14 }}>
        <Heading eyebrow="Find your room">Shop by category</Heading>
        {categories.isError ? <Notice error>Categories could not load. Pull down to try again.</Notice> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15, paddingRight: 20 }}>{(categories.data ?? []).map((item: any) => <Pressable key={item.id} onPress={() => router.push({ pathname: "/(tabs)/shop", params: { category: item.id } })} accessibilityRole="button" accessibilityLabel={`Shop ${item.name}`} style={{ width: 68, alignItems: "center", gap: 7 }}><Image source={{ uri: item.image_url }} style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: t.surfaceMuted }} resizeMode="cover" /><Text numberOfLines={2} style={{ color: t.text, fontFamily: "serif", fontSize: 11, textAlign: "center" }}>{item.name}</Text></Pressable>)}</ScrollView>}
      </View>

      <View style={{ gap: 13 }}>
        <Heading eyebrow="The NESTORA edit">Rooms to make your own</Heading>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
          {promoCards.map((item) => {
            const categoryId = (categories.data ?? []).find((candidate: any) => candidate.slug === item.slug)?.id;
            return <Pressable key={item.slug} onPress={() => categoryId ? router.push({ pathname: "/(tabs)/shop", params: { category: categoryId } }) : router.push("/(tabs)/shop")} accessibilityRole="button" accessibilityLabel={`${item.eyebrow}: ${item.title.replace("\n", " ")}`} style={{ width: 300, height: 190, flexDirection: "row", backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, overflow: "hidden" }}>
              <View style={{ width: "54%", justifyContent: "center", gap: 8, padding: 13 }}><Text style={{ color: t.accent, fontSize: 9, letterSpacing: 1.1 }}>{item.eyebrow.toUpperCase()}</Text><Text style={{ color: t.text, fontFamily: "serif", fontSize: 19, lineHeight: 23 }}>{item.title}</Text><View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Text numberOfLines={1} style={{ color: t.secondary, fontSize: 10 }}>{item.action}</Text><Feather name="arrow-right" size={12} color={t.accent} /></View></View>
              <Image source={{ uri: item.image }} accessibilityLabel={item.alt} style={{ width: "46%", height: "100%", backgroundColor: t.surfaceMuted }} resizeMode="cover" />
            </Pressable>;
          })}
        </ScrollView>
      </View>

      <Heading eyebrow="Chosen for everyday">Best sellers</Heading>{best.isError ? <Notice error>Products could not load right now.</Notice> : best.data?.length ? <ProductGrid products={best.data.slice(0, 4)} /> : <Notice>No best sellers are available right now.</Notice>}
      <Heading eyebrow="A few considered pieces">Featured products</Heading>{featured.isError ? <Notice error>Products could not load right now.</Notice> : featured.data?.length ? <ProductGrid products={featured.data.slice(0, 4)} /> : <Notice>No featured products are available right now.</Notice>}
    </>}
  </Page>;
}

function TrustCard({ icon, title, description }: { icon: "truck" | "tag"; title: string; description: string }) {
  const t = useTheme();
  return <View style={{ flex: 1, minHeight: 92, flexDirection: "row", alignItems: "center", gap: 9, padding: 11, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}><Feather name={icon} size={20} color={t.accent} /><View style={{ flex: 1, gap: 4 }}><Text style={{ color: t.text, fontSize: 11, fontWeight: "700" }}>{title}</Text><Text style={{ color: t.secondary, fontSize: 10, lineHeight: 14 }}>{description}</Text></View></View>;
}
