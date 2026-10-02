# NESTORA

Customer-facing furniture storefront built with Next.js App Router, TypeScript, Tailwind CSS, Supabase and Nigerian Naira pricing.

## What is here

- Responsive homepage in the required PRD order.
- Product catalogue, category and product detail routes backed by Supabase queries.
- Initial database schema, RLS policies, profile trigger and starter catalogue in `supabase/migrations`.
- Google OAuth server flow and Supabase SSR cookie handling foundation.
- Newsletter subscription action with duplicate-safe persistence.
- Empty catalogue states when Supabase is not connected; the UI does not substitute in-memory commerce data.

The eight starter products, prices and stock counts are an initial proposed catalogue, authored for NESTORA. Verify those details against supplier quotes and actual inventory before accepting orders. Starter imagery currently uses remote Unsplash photo URLs; replace the references with approved product photos uploaded to the Supabase `product-images` bucket before launch.

## Run locally

Install Node.js 20.9 or newer and npm, then from this folder:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without Supabase environment values, public pages show intentional empty catalogue states and protected pages lead to sign-in setup.

## Supabase

1. Create a Supabase project.
2. Copy the Project URL and Publishable key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. In Supabase Dashboard → SQL Editor, run `supabase/migrations/202610010001_initial_schema.sql`, then `supabase/migrations/202610010002_checkout_function.sql`, then `supabase/migrations/202610010003_storefront_preferences.sql`, then `supabase/migrations/202610010004_distinct_homepage_products.sql`, then `supabase/migrations/202610010005_add_eight_catalogue_products.sql`.
4. Keep `.env.local` private. It is ignored by Git. Never put a service-role key in this app.

The standard delivery fee is configured as ₦6,500 (650,000 kobo) by the storefront preferences migration. Order creation reads this setting server-side. The opening Best Sellers selection is manually curated and is not computed from sales counts.

## Secrets

Mailgun and business-owner settings belong only in local/server environment variables:

- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_API_BASE_URL` (use Mailgun's regional API host if your account is in the EU)
- `MAILGUN_FROM_EMAIL`
- `BUSINESS_OWNER_EMAIL`
- `SITE_URL` (server-only base URL used for OAuth and order links)

Google OAuth is configured through Google Cloud and the Supabase Auth provider. The Google client secret is stored in Supabase, never in browser code.
