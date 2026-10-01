import type { Metadata } from "next";
import Link from "next/link";
import { signInWithGoogle } from "./actions";

export const metadata: Metadata = { title: "Sign in" };
type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const setupMissing = params.error === "setup" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return <section className="login-page section"><div className="login-panel"><span className="eyebrow">Welcome to NESTORA</span><h1>A little space<br /><em>for you.</em></h1><p>Sign in to keep your favourites, bag and orders together.</p>{setupMissing ? <div className="setup-message"><strong>Sign-in setup is not connected yet.</strong><span>We’ll connect your Supabase and Google accounts before enabling customer sign-in.</span></div> : params.error ? <p className="form-error" role="alert">We couldn’t start Google sign-in. Please try again.</p> : null}<form action={signInWithGoogle}><input type="hidden" name="next" value={params.next ?? "/account"} /><button type="submit" className="button button-dark login-button" disabled={setupMissing}>Continue with Google <span aria-hidden="true">↗</span></button></form><Link className="login-back" href="/shop">Continue browsing</Link></div></section>;
}
