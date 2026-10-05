import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextValue = { session: Session | null; ready: boolean };
const AuthContext = createContext<AuthContextValue>({ session: null, ready: false });
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setReady(true); });
    return () => subscription.unsubscribe();
  }, []);
  return <AuthContext.Provider value={{ session, ready }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
