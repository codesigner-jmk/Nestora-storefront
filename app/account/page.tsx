import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/customer";
import { signOut } from "@/app/actions/customer";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const { supabase, user } = await requireCustomer("/account");
  const { data: profile } = await supabase.from("profiles").select("full_name,email,phone").eq("id", user.id).maybeSingle();
  return <section className="section customer-page"><div className="wrap"><div className="customer-heading"><span className="eyebrow">Your space</span><h1>Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : " back"}.</h1><p>Your orders and saved pieces, together in one place.</p></div><div className="account-grid"><Link href="/account/orders"><span className="eyebrow">01</span><h2>Your orders</h2><p>See what you’ve ordered and follow each order.</p><span className="text-link">View orders ↗</span></Link><Link href="/wishlist"><span className="eyebrow">02</span><h2>Your wishlist</h2><p>Return to the pieces you’ve saved.</p><span className="text-link">View wishlist ↗</span></Link><div><span className="eyebrow">03</span><h2>Your details</h2><p>{profile?.email ?? user.email}<br />{profile?.phone ?? "Add a phone number at checkout"}</p></div></div><form action={signOut}><button className="text-link signout-button" type="submit">Sign out</button></form></div></section>;
}
