# NESTORA

NESTORA is a responsive furniture and home-living storefront for customers in Nigeria. The site is built with Next.js App Router, React, TypeScript, Tailwind CSS and Supabase, with product prices displayed in Nigerian naira.

## Storefront

- A split-layout homepage hero with three rotating interior photographs and accessible slideshow controls.
- A light and dark theme switch that follows the device preference on first visit and remembers a browser's choice.
- Circular category navigation, two room collection banners, a curated Best Sellers selection, an introduction to NESTORA, a trust stripe, featured products, the brand story and newsletter signup.
- A searchable and filterable product catalogue, category pages and product details backed by Supabase.
- Google sign-in, persistent customer wishlists and carts, checkout, order history and order details.
- Order confirmation emails through Resend.

## Catalogue and imagery

The opening catalogue contains 16 furniture and home products across the available categories. Product prices and stock quantities are proposed starting values; confirm them with suppliers and actual inventory before taking orders. The opening Best Sellers group is selected manually for merchandising and is not calculated from sales history. Product and lifestyle photography currently uses remote Unsplash image URLs. Replace these with approved, rights-cleared product photography as it becomes available.

## Run locally

Install Node.js 20.9 or newer. In this folder, install the packages and create your local settings file:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Add the service credentials below to `.env.local` to connect the storefront. Keep that file private; it is excluded from Git. Without Supabase settings, catalogue pages show an intentional empty state and protected customer features require configuration.

## Supabase setup

1. Create a Supabase project and copy its Project URL and Publishable key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. In the Supabase SQL Editor, run the files in `supabase/migrations` in timestamp order, including `202610020006_fix_checkout_ambiguous_id.sql`.
3. Never put a Supabase service-role key in browser code or commit local credentials.

Checkout uses one standard delivery charge of ₦6,500 per order. The fee is stored in Supabase and included in the server-calculated order total. New orders begin with `pending` status.

## Authentication and email

Configure Google OAuth in Google Cloud Console and enable the Google provider in Supabase Auth. Keep the Google client secret in the Supabase provider settings.

Add these server-side environment variables for order emails and site links:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` — a sender address permitted by Resend; customer email delivery requires a verified sending domain.
- `BUSINESS_OWNER_EMAIL`
- `SITE_URL` — the deployed site URL in production, or `http://localhost:3000` for local development.

## Deployment

The storefront can be deployed to Vercel. Add the same environment variables to the Vercel project, using the production site URL for `SITE_URL`, then deploy the connected GitHub branch.
