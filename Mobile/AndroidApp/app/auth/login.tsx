import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Page, Heading, Action } from "../../components/Screen";
import { useTheme } from "../../lib/theme";
import { supabase } from "../../lib/supabase";

WebBrowser.maybeCompleteAuthSession();
export default function Login() {
  const t = useTheme(); const [busy, setBusy] = useState(false);
  async function signIn() {
    if (!supabase) { Alert.alert("Sign-in unavailable", "Supabase is not configured for this build."); return; }
    setBusy(true);
    try {
      const redirectTo = Linking.createURL("auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true, queryParams: { access_type: "offline", prompt: "consent" } } });
      if (error || !data.url) throw error ?? new Error("Google sign-in could not start.");
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success") return;
      const callback = new URL(result.url);
      const code = callback.searchParams.get("code");
      if (code) { const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code); if (exchangeError) throw exchangeError; }
      else {
        const fragment = new URLSearchParams(callback.hash.replace(/^#/, ""));
        const access_token = fragment.get("access_token"); const refresh_token = fragment.get("refresh_token");
        if (!access_token || !refresh_token) throw new Error("The sign-in response was incomplete.");
        const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token }); if (sessionError) throw sessionError;
      }
    } catch { Alert.alert("Could not sign in", "Please try Google sign-in again."); }
    finally { setBusy(false); }
  }
  return <Page scroll={false}><View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 34, gap: 26 }}><Text style={{ color: t.text, fontFamily: "serif", fontSize: 22, letterSpacing: 4 }}>NESTORA</Text><Heading eyebrow="Modern furniture for modern living">A little space{"\n"}for you.</Heading><Text style={{ color: t.secondary, fontSize: 15, lineHeight: 24 }}>Sign in to shop, save pieces you love and keep your orders together.</Text><Action label={busy ? "Opening Google…" : "Continue with Google"} onPress={signIn} /></View></Page>;
}
