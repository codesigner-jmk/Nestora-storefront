import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../lib/theme";

const icons = { index: "home", shop: "grid", wishlist: "heart", cart: "shopping-cart", account: "user" } as const;
export default function TabLayout() {
  const t = useTheme();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: t.accent, tabBarInactiveTintColor: t.secondary, tabBarStyle: { height: 64, paddingTop: 7, paddingBottom: 7, backgroundColor: t.surface, borderTopColor: t.border }, tabBarLabelStyle: { fontSize: 10 }, tabBarIcon: ({ color, focused }) => <Feather name={icons[route.name as keyof typeof icons] ?? "circle"} color={color} size={20} strokeWidth={focused ? 2.4 : 1.7} /> })}>
    <Tabs.Screen name="index" options={{ title: "Home" }} /><Tabs.Screen name="shop" options={{ title: "Shop" }} /><Tabs.Screen name="wishlist" options={{ title: "Wishlist" }} /><Tabs.Screen name="cart" options={{ title: "Cart" }} /><Tabs.Screen name="account" options={{ title: "Account" }} />
  </Tabs>;
}
