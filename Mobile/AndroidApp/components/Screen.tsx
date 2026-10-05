import type { ReactNode } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../lib/theme";
import { formatNaira } from "../lib/format";
import { Link } from "expo-router";

export function Page({ children, scroll = true, refreshing = false, onRefresh }: { children: ReactNode; scroll?: boolean; refreshing?: boolean; onRefresh?: () => void }) {
  const theme = useTheme();
  const body = <View style={{ padding: 20, gap: 20, backgroundColor: theme.background, minHeight: "100%" }}>{children}</View>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right"]}>{scroll ? <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ paddingBottom: 32 }} refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} /> : undefined}>{body}</ScrollView> : body}</SafeAreaView>;
}
export function Heading({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  const t = useTheme();
  return <View style={{ gap: 6 }}>{eyebrow ? <Text style={{ color: t.accent, fontSize: 11, letterSpacing: 2, fontWeight: "700" }}>{eyebrow.toUpperCase()}</Text> : null}<Text style={{ color: t.text, fontSize: 28, lineHeight: 34, fontFamily: "serif" }}>{children}</Text></View>;
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  const t = useTheme(); return <Text style={{ color: error ? t.danger : t.secondary, lineHeight: 22 }}>{children}</Text>;
}
export function Loading() { const t = useTheme(); return <Page><ActivityIndicator color={t.accent} /></Page>; }
export function ProductCard({ product }: { product: any }) {
  const t = useTheme(); const image = [...(product.product_images ?? [])].sort((a: any,b: any)=>a.display_order-b.display_order)[0];
  return <Link href={{ pathname: "/shop/[slug]", params: { slug: product.slug } }} asChild>
    <Pressable style={{ flex: 1, gap: 8 }} accessibilityRole="button" accessibilityLabel={`View ${product.name}`}>
      {image ? <Image source={{ uri: image.image_url }} style={{ width: "100%", aspectRatio: 0.83, backgroundColor: t.surfaceMuted }} resizeMode="cover" /> : <View style={{ width: "100%", aspectRatio: 0.83, backgroundColor: t.surfaceMuted }} />}
      <Text numberOfLines={2} style={{ color: t.text, fontSize: 15 }}>{product.name}</Text>
      <Text style={{ color: t.secondary, fontSize: 13 }}>{formatNaira(product.price_kobo)}</Text>
    </Pressable>
  </Link>;
}
export function ProductGrid({ products }: { products: any[] }) {
  const rows: any[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));
  return <View style={{ gap: 22 }}>{rows.map((row, idx) => <View key={idx} style={{ flexDirection: "row", gap: 14 }}>{row.map((product) => <ProductCard key={product.id} product={product} />)}{row.length === 1 ? <View style={{ flex: 1 }} /> : null}</View>)}</View>;
}
export function Action({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  const t = useTheme(); return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={{ opacity: disabled ? .6 : 1, backgroundColor: secondary ? t.surface : t.accent, borderColor: t.border, borderWidth: secondary ? 1 : 0, minHeight: 50, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 }}><Text style={{ color: secondary ? t.text : "#FFFFFF", fontWeight: "600" }}>{label}</Text></Pressable>;
}
