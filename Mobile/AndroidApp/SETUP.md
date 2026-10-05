# NESTORA Android client

This is the native Expo/React Native client. It lives in its own project folder beside the Next.js storefront and uses the same Supabase project and customer identity.

## Local setup

1. Install Node.js 22.13 or newer and run `pnpm install` from this folder.
2. Set the public Supabase URL, publishable key, and deployed website origin in `.env.local` using `.env.example` as a guide. If this workspace already had the website's public Supabase settings, they have been copied into the mobile `.env.local`; check that `EXPO_PUBLIC_SITE_URL` points to the deployed website, not localhost. The app sends checkout to its authenticated server endpoint so order emails remain server-side.
3. Apply the website Supabase migrations in timestamp order, including `../../supabase/migrations/202610050007_mobile_shared_cart.sql`.
4. In Supabase Auth, add `nestora://auth/callback` to the allowed redirect URLs. Keep the existing Google provider and OAuth client secret in Supabase; no Google secret belongs in this project.
5. Start the app with `pnpm start` and use an Android development build for native OAuth testing.

## APK

`pnpm build:apk` creates an internal-distribution APK through EAS. Configure the same three `EXPO_PUBLIC_*` variables in the EAS environment used for that build. The EAS project must be linked to the Nestora Expo account before the build can run.

## Shared cart behavior

Both clients subscribe to `carts` and `cart_items` changes. Realtime only invalidates/refetches their cart; Supabase and RLS remain authoritative. The shared cart RPCs validate product availability, variant ownership, and stock before insert/update. Checkout uses the existing `create_order_from_cart` RPC, and the website server sends both existing Resend confirmation emails.

## Current boundaries

The Supabase project URL, publishable key, and website origin are the only public environment values. Resend credentials stay in the Next.js server environment. Profile name/phone and saved delivery addresses are managed through the existing RLS-protected tables.
