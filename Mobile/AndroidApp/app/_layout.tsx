import { useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, Image, StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import { Stack, Redirect, useSegments } from "expo-router";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "../lib/auth";
import { queryClient } from "../lib/query";
import { useTheme } from "../lib/theme";
import { Loading } from "../components/Screen";

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 0, fade: false });

function Gate() {
  const { session, ready } = useAuth(); const segments = useSegments(); const t = useTheme();
  const isLogin = segments[0] === "auth";
  if (!ready) return <Loading />;
  if (!session && !isLogin) return <Redirect href="/auth/login" />;
  if (session && isLogin) return <Redirect href="/(tabs)" />;
  return <><StatusBar style={t.background === "#191A16" ? "light" : "dark"} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.background }, animation: "slide_from_right" }} /></>;
}

function AppFrame() {
  const { ready } = useAuth();
  const colorScheme = useColorScheme();
  const { height } = useWindowDimensions();
  const [splashVisible, setSplashVisible] = useState(true);
  const slideY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener("change", (state) => {
      focusManager.setFocused(state === "active");
      if (state === "active" && previous !== "active") void queryClient.invalidateQueries();
      previous = state;
    });
    focusManager.setFocused(AppState.currentState === "active");
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void SplashScreen.hideAsync().then(() => {
      if (cancelled) return;
      Animated.timing(slideY, { toValue: -height, duration: 480, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
        if (finished) setSplashVisible(false);
      });
    }).catch(() => setSplashVisible(false));
    return () => { cancelled = true; };
  }, [ready, height, slideY]);

  return <View style={{ flex: 1 }}>
    <Gate />
    {splashVisible ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 1000, elevation: 1000, alignItems: "center", justifyContent: "center", backgroundColor: colorScheme === "dark" ? "#191A16" : "#F8F6F2", transform: [{ translateY: slideY }] }]}>
      <Image source={colorScheme === "dark" ? require("../assets/splash-dark.png") : require("../assets/splash-light.png")} style={{ width: 320, height: 113 }} resizeMode="contain" />
    </Animated.View> : null}
  </View>;
}

export default function RootLayout() {
  return <QueryClientProvider client={queryClient}><AuthProvider><AppFrame /></AuthProvider></QueryClientProvider>;
}
