import { Alert, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Heading, Notice, Page } from "../../components/Screen";
import { supabase } from "../../lib/supabase";
import { keys } from "../../lib/query";
import { useTheme } from "../../lib/theme";
export default function Account() {
  const t=useTheme(); const profile=useQuery({queryKey:keys.profile,queryFn:async()=>{ if(!supabase)throw new Error();const{data:{user}}=await supabase.auth.getUser();if(!user)return null;const{data,error}=await supabase.from("profiles").select("full_name,email,phone").eq("id",user.id).maybeSingle();if(error)throw error;return data; }});
  async function signOut(){const result=await supabase?.auth.signOut();if(result?.error)Alert.alert("Could not sign out","Please try again.");}
  const row=(label:string,action:()=>void)=><Pressable key={label} onPress={action} style={{paddingVertical:17,borderBottomWidth:1,borderBottomColor:t.border}}><Text style={{color:t.text,fontSize:16}}>{label}  →</Text></Pressable>;
  return <Page refreshing={profile.isRefetching} onRefresh={() => { void profile.refetch(); }}><Heading eyebrow="Your space">Account</Heading>{profile.isError?<Notice error>Account details could not be loaded.</Notice>:<Text style={{color:t.secondary,lineHeight:22}}>{profile.data?.full_name??"Welcome back"}{profile.data?.email?`\n${profile.data.email}`:""}</Text>}<View>{row("Orders",()=>router.push("/orders"))}{row("Addresses",()=>router.push("/account/addresses"))}{row("Profile",()=>router.push("/account/profile"))}{row("Sign out",signOut)}</View></Page>;
}
