# 1. Architecture Overview

NESTORA V1 is a customer-facing e-commerce application inspired by the core shopping experience of platforms such as Shopify, but built as a custom single-store application.

The application allows customers to:

- Browse products
- Browse categories
- Search and filter products
- View product details
- Add products to a wishlist
- Add products to a persistent cart
- Authenticate with Google
- Complete checkout
- Create orders
- Receive order confirmation emails
- View previous orders
- View individual order details
- Subscribe to the newsletter

The application does **not** include:

- An admin dashboard
- Online payment processing
- Multi-vendor functionality
- Product management UI
- Order management UI
- Advanced shipping management
- Coupon management
- Multi-currency support

The architecture must make it possible to add these capabilities in V2 without requiring a complete rewrite.

# 2. Architectural Principles

The application must follow these principles.

## 2.1 Database as the source of truth

Persistent application data must live in Supabase PostgreSQL.

The frontend must not be treated as the source of truth for:

- Prices
- Stock
- Orders
- Wishlist data
- Customer information
- Cart data
- Order totals

Client-side state is used for UI interaction only.

## 2.2 Server validates important operations

The server/database must validate:

- Product availability
- Product status
- Product price
- Stock quantity
- Order totals
- Customer ownership of resources
- Order creation

The browser must never be trusted to submit a final price or total.

## 2.3 Security by default

Supabase Row Level Security (RLS) must be enabled for customer-owned tables.

Customers must only be able to access their own:

- Profile
- Cart
- Wishlist
- Addresses
- Orders

Customers must never be able to directly modify:

- Product prices
- Product stock
- Order totals
- Order status
- Another customer's information
- Another customer's orders

## 2.4 Server-only secrets

Sensitive credentials must never be exposed to browser JavaScript.

Examples:

- Mailgun API key
- Server-only Supabase credentials, if ever required
- Private service credentials

## 2.5 Componentized architecture

The application should be divided into reusable components rather than creating large page components.

Examples:

ProductCard

ProductGrid

ProductGallery

WishlistButton

AddToCartButton

CartItem

QuantitySelector

CheckoutSummary

OrderCard

OrderStatusBadge

# 3. Technology Stack

## 3.1 Frontend

### Next.js

Use Next.js with the App Router.

Responsibilities:

- Application routing
- Server-side rendering
- Server Components
- Client Components
- Server Actions / Route Handlers
- Metadata
- Authentication-aware pages
- API endpoints where required

### React

Used as the component framework within Next.js.

### TypeScript

TypeScript is required throughout the application.

Do not introduce large amounts of any.

Database types should be generated from the Supabase schema where practical.

### Tailwind CSS

Tailwind CSS is the primary styling system.

Reusable design tokens should be defined rather than repeatedly hardcoding arbitrary values.

## 3.2 Backend / Database

### Supabase

Supabase provides:

- PostgreSQL database
- Authentication
- Google OAuth integration
- Row Level Security
- Storage
- Database functions/RPC
- Realtime capabilities if required in future

Supabase is the primary backend platform

## 3.3 Authentication

Authentication uses:

Google OAuth

↓

Google Cloud Console

↓

Supabase Auth

↓

Next.js application

V1 should use Google authentication as the primary authentication method.

A separate username/password authentication system is not required unless explicitly added later.

A new customer account is created automatically when a user authenticates through Google for the first time.

## 3.4 Email

### Mailgun

Mailgun is responsible for transactional email.

V1 sends order confirmation emails to:

1.  The customer
2.  The business owner

Email sending must happen on the server.

The browser must never call Mailgun directly.

## 3.5 Deployment

### Vercel

The Next.js application will be deployed on Vercel.

Deployment architecture:

GitHub

↓

Vercel

↓

Next.js Application

↓

Supabase

↓

Mailgun

# 4. System Architecture

┌─────────────────────┐

│ Customer │

│ Browser / Mobile │

└──────────┬──────────┘

│

▼

┌─────────────────────┐

│ Next.js │

│ Application │

└──────────┬──────────┘

│

┌────────────────┼────────────────┐

│ │ │

▼ ▼ ▼

┌────────────┐ ┌─────────────┐ ┌─────────────┐

│ Supabase │ │ Mailgun │ │ Google │

│ PostgreSQL │ │ Email │ │ OAuth │

│ Auth │ │ Service │ │ │

│ Storage │ │ │ │ │

└────────────┘ └─────────────┘ └─────────────┘

# 5. Application Architecture

The application uses three broad layers.

Presentation Layer

↓

Application / Business Logic Layer

↓

Data Layer

## 5.1 Presentation Layer

Responsible for:

- Pages
- Layouts
- Components
- Forms
- Loading states
- Error states
- Responsive UI

Examples:

app/

components/

## 5.2 Application Layer

Responsible for:

- Authentication flows
- Cart operations
- Wishlist operations
- Checkout
- Order creation
- Email orchestration
- Validation
- Business rules

Examples:

lib/

app/api/

Server Actions

Database RPC functions

## 5.3 Data Layer

Responsible for:

- PostgreSQL
- Supabase Auth
- Supabase Storage
- RLS
- Database functions
- Database constraints
- Indexes

# 6. Rendering Strategy

Use Next.js Server Components by default.

Pages should be Server Components unless they require browser-side interaction.

## Server Components

Prefer Server Components for:

- Homepage
- Shop page
- Category pages
- Product detail pages
- Orders page
- Order detail page
- Initial cart data
- Initial wishlist data

## Client Components

Use Client Components only when interaction requires browser JavaScript.

Examples:

WishlistButton

AddToCartButton

QuantitySelector

SearchInput

FilterControls

MobileMenu

ImageGallery

CheckoutForm

GoogleLoginButton

Avoid converting entire pages into Client Components just because one component requires interactivity.

# 7. Supabase Client Architecture

Create separate Supabase utilities.

lib/

└── supabase/

├── client.ts

├── server.ts

└── middleware.ts

## client.ts

Used for browser-side Supabase interactions where necessary.

## server.ts

Used by:

- Server Components
- Server Actions
- Route Handlers

It must use the authenticated user's session from cookies.

## middleware.ts

Responsible for maintaining authentication session state and protecting authenticated routes.

Protected routes include:

/wishlist

/cart

/checkout

/account

/account/orders

/account/orders/\[orderId\]

Unauthenticated customers attempting to access protected pages should be redirected to /login.

# 8. Route Architecture

Recommended application structure:

app/

│

├── layout.tsx

├── page.tsx

│

├── login/

│ └── page.tsx

│

├── shop/

│ ├── page.tsx

│ └── \[slug\]/

│ └── page.tsx

│

├── categories/

│ └── \[slug\]/

│ └── page.tsx

│

├── wishlist/

│ └── page.tsx

│

├── cart/

│ └── page.tsx

│

├── checkout/

│ └── page.tsx

│

├── account/

│ ├── page.tsx

│ └── orders/

│ ├── page.tsx

│ └── \[orderId\]/

│ └── page.tsx

│

├── auth/

│ └── callback/

│ └── route.ts

│

└── api/

└── ...

# 9. Core URL Structure

| **Route**                   | **Purpose**           | **Authentication** |
|-----------------------------|-----------------------|--------------------|
| /                           | Homepage              | Public             |
| /shop                       | Product catalogue     | Public             |
| /shop/\[slug\]              | Product detail        | Public             |
| /categories/\[slug\]        | Category products     | Public             |
| /login                      | Google authentication | Public             |
| /wishlist                   | Customer wishlist     | Required           |
| /cart                       | Customer cart         | Required           |
| /checkout                   | Checkout              | Required           |
| /account                    | Customer account      | Required           |
| /account/orders             | Customer orders       | Required           |
| /account/orders/\[orderId\] | Order details         | Required           |

# 10. Homepage Architecture

The homepage must follow this exact order:

Homepage

│

├── Hero

│

├── Featured Categories

│

├── Best Sellers

│

├── Promotional Section

│

├── Featured Products

│

├── Trust Stripe

│

├── Why Shop With Us

│

├── Newsletter

│

└── Footer

## Dynamic homepage data

The following can be database-driven:

- Categories
- Products
- Featured products
- Best sellers
- Product images

The following may remain code-managed in V1:

- Hero layout
- Promotional copy
- Trust messaging
- Why-shop-with-us content
- Footer structure

The architectural distinction is:

> Transactional and catalogue data must persist in the database. Static presentation content does not need database storage unless it needs to be edited dynamically.

# 11. Product Architecture

## Product model

A product belongs to a category.

Category

│

└── Products

│

├── Images

│

└── Variants

Products can either:

1.  Have no variants
2.  Have one or more variants

Examples:

### No variants

Modern Oak Side Table

Price: ₦85,000

Stock: 10

### With variants

Cloud Sofa

Color:

\- Cream

\- Brown

\- Charcoal

Size:

\- 2-Seater

\- 3-Seater

V1 should support basic variants without introducing a complex product-option engine.

# 12. Product Pricing

All monetary values should be stored as integers in **kobo**, not floating-point decimals.

Example:

₦150,000

is stored as:

15000000

This avoids floating-point rounding problems.

Recommended database fields:

price_kobo

subtotal_kobo

delivery_fee_kobo

total_kobo

The frontend converts kobo to naira only for display.

# 13. Product Catalogue

Products must contain:

- Name
- Slug
- Description
- Price
- SKU
- Stock
- Category
- Images
- Variants
- Active status
- Featured status
- Best-seller status

Products marked:

is_active = true

can be displayed publicly.

Products marked:

is_active = false

must not appear in normal public catalogue results.

# 14. Search Architecture

V1 search should search product:

- Name
- Description
- SKU where appropriate

Search parameters should be passed through the URL.

Example:

/shop?search=sofa

Filtering:

/shop?category=sofas

Sorting:

/shop?sort=price_asc

/shop?sort=price_desc

Multiple parameters may be combined.

Example:

/shop?category=sofas&sort=price_asc

V1 does not require a dedicated external search engine.

# 15. Best Sellers Architecture

V1 does not have a payment system, so "Best Sellers" should not be calculated automatically from completed payments.

Instead, products use:

is_best_seller

The business can mark products as best sellers through database data/seeding.

# 16. Featured Products

Products use:

is_featured

to determine whether they appear in the Featured Products section.

Only active products can appear

# 17. Wishlist Architecture

Each authenticated customer has one wishlist.

Relationship:

User

│

└── Wishlist

│

└── Wishlist Items

│

└── Products

Recommended flow:

Product Page

↓

Add to Wishlist

↓

Authenticated?

/ \\

No Yes

↓ ↓

Login Save

↓

Supabase

Wishlist operations:

- Add product
- Remove product
- View wishlist
- Add wishlist item to cart

Wishlist data must persist in Supabase.

# 18. Cart Architecture

Each authenticated customer has one active cart.

Relationship:

User

│

└── Cart

│

└── Cart Items

│

├── Product

└── Variant

Cart operations:

- Add item
- Increase quantity
- Decrease quantity
- Remove item
- View subtotal
- Proceed to checkout

The cart does not become the source of truth for final pricing.

At checkout, prices and stock are revalidated from the database.

# 19. Checkout Architecture

Checkout requires authentication.

Flow:

Cart

↓

Checkout

↓

Validate Customer

↓

Read Cart

↓

Validate Products

↓

Validate Variants

↓

Validate Stock

↓

Read Current Prices

↓

Calculate Subtotal

↓

Calculate Delivery Fee

↓

Calculate Total

↓

Create Order

↓

Create Order Items

↓

Update Stock

↓

Clear Cart

↓

Send Emails

↓

Order Success

## Delivery Fee Policy

NESTORA uses a **single standard delivery fee per order**.

The delivery fee is:

- Applied once per order, not per product.
- Determined server-side during checkout.
- Stored in the order as a snapshot.
- Included in the final order total.
- Not calculated from the customer's browser.
- Not dynamically calculated by distance, weight, product size, or number of items in V1.
- Not automatically free unless the configured business rule explicitly sets the fee to ₦0.

### Checkout calculation

Subtotal

\+ Standard Delivery Fee

= Order Total

Example:

Products: ₦250,000

Delivery: ₦10,000

--------------------------------

Total: ₦260,000

The ₦10,000 above is an example only. The actual standard delivery amount must be configured by the business.

## Delivery Fee Configuration

The delivery fee must not be hardcoded inside checkout components.

Store the active fee as persistent business configuration.

Recommended configuration:

store_settings

----------------------------

id

standard_delivery_fee_kobo

currency

updated_at

Initial values:

currency = NGN

standard_delivery_fee_kobo = \<business-configured amount\>

Because V1 has no admin dashboard, the initial value may be inserted through the database seed/migration.

The checkout UI reads the configured value from the backend.

## Server-Side Calculation

The browser must never be trusted to determine the delivery fee.

During checkout:

Authenticated Customer

↓

Read Cart

↓

Read Current Product Prices

↓

Validate Stock

↓

Read Standard Delivery Fee

↓

Calculate Subtotal

↓

Calculate Total

↓

Create Order

The server is authoritative for:

product prices

stock

delivery fee

subtotal

total

## Order Snapshot

When an order is created, the delivery fee must be stored directly on the order.

For example:

orders

--------------------------------

subtotal_kobo

delivery_fee_kobo

total_kobo

This is important because the configured delivery fee may change later.

An existing order must continue displaying the delivery fee that was actually charged when the order was placed.

## V1 Exclusions

Do not implement the following in V1 unless explicitly requested:

- Distance-based pricing
- Google Maps distance calculation
- Weight-based shipping
- Product-size-based shipping
- Multiple delivery providers
- Delivery-zone management
- Free-shipping thresholds
- Promotional shipping discounts
- Same-day delivery pricing
- Express delivery pricing
- Pickup pricing
- Per-product delivery fees

These can be introduced as a future shipping system without changing the fundamental order model.

## Customer Experience

The checkout should clearly display:

Subtotal ₦250,000

Delivery ₦10,000

────────────────────────────────

Total ₦260,000

The customer should see the delivery fee before confirming the order.

Do not hide the delivery fee until after the order is created.

## Final V1 Rule

> **One order = one standard delivery fee, calculated server-side and saved with the order.**

# 20. Atomic Order Creation

Order creation must be atomic.

A customer must not end up with:

Order created

\+

Stock not updated

or:

Order created

\+

Order items missing

or:

Stock reduced

\+

Order failed

The preferred implementation is a PostgreSQL database function/RPC responsible for the transactional portion of order creation.

Conceptually:

create_order()

│

├── Identify authenticated user

│

├── Read cart

│

├── Validate products

│

├── Validate stock

│

├── Read current prices

│

├── Calculate totals

│

├── Create order

│

├── Create order items

│

├── Reduce stock

│

└── Clear cart

If any critical step fails, the transaction should roll back.

# 21. Order Price Snapshot

Order items must store the product information used at the time the order was created.

Example:

Product currently:

Cloud Sofa

₦350,000

Customer purchases it.

Later:

Cloud Sofa

₦400,000

The customer's historical order must still display:

Cloud Sofa

₦350,000

Therefore order_items stores:

product_name

product_price_kobo

variant_name

quantity

subtotal_kobo

Orders must never depend on the current product price to display historical order information.

# 22. Order Status Architecture

V1 supports:

pending

confirmed

processing

shipped

delivered

cancelled

Initial status:

pending

or:

confirmed

depending on the final business workflow.

Because V1 has no admin dashboard, order status changes will initially require database/backend operations.

Customers can view the status but cannot change it.

# 23. Order Ownership

Every order must contain:

user_id

Customers can only retrieve orders where:

orders.user_id = auth.uid()

A customer attempting to access another customer's order by manipulating the URL must receive a not-found/unauthorized result.

Example:

/account/orders/ORDER-ID

must never expose another customer's order.

# 24. Customer Account Architecture

The customer account contains:

Account

│

├── Profile

│

├── Orders

│

└── Account Actions

Potential V1 profile fields:

- Full name
- Email
- Phone
- Avatar

Google account information should be used to populate initial profile data.

# 25. Database Architecture

Supabase PostgreSQL is the single source of truth for application data.

Core entities:

profiles

categories

products

product_images

product_variants

cart

cart_items

wishlists

wishlist_items

addresses

orders

order_items

newsletter_subscribers

Optional email tracking:

order_email_logs

# 26. Database Schema

## 26.1 profiles

Stores customer profile information.

profiles

--------------------------------

id UUID PK

email TEXT

full_name TEXT

avatar_url TEXT

phone TEXT

role TEXT

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

Relationships:

profiles.id → auth.users.id

Default role:

customer

# 27. categories

categories

--------------------------------

id UUID PK

name TEXT

slug TEXT UNIQUE

description TEXT

image_url TEXT

is_active BOOLEAN

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

Examples:

Sofas

Beds

Dining

Tables

Chairs

Storage

Lighting

Home Decor

# 28. products

products

--------------------------------

id UUID PK

category_id UUID FK

name TEXT

slug TEXT UNIQUE

description TEXT

price_kobo BIGINT

stock_quantity INTEGER

sku TEXT UNIQUE

is_active BOOLEAN

is_featured BOOLEAN

is_best_seller BOOLEAN

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

Relationship:

categories

│

└── products

# 29. product_images

product_images

--------------------------------

id UUID PK

product_id UUID FK

image_url TEXT

alt_text TEXT

display_order INTEGER

created_at TIMESTAMPTZ

Relationship:

products

│

└── product_images

Images are stored in Supabase Storage.

The database stores their metadata and public/storage path.

# 30. product_variants

product_variants

--------------------------------

id UUID PK

product_id UUID FK

name TEXT

value TEXT

price_modifier_kobo BIGINT

stock_quantity INTEGER

sku TEXT

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

Example:

Product: Cloud Sofa

name: Color

value: Cream

name: Color

value: Brown

For V1, variant modelling should remain simple.

# 31. cart

cart

--------------------------------

id UUID PK

user_id UUID UNIQUE FK

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

One active cart per customer.

# 32. cart_items

cart_items

--------------------------------

id UUID PK

cart_id UUID FK

product_id UUID FK

variant_id UUID NULL FK

quantity INTEGER

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

The cart should not permanently trust a stored product price.

Current product/variant pricing is retrieved when calculating the cart and checkout total.

# 33. wishlists

wishlists

--------------------------------

id UUID PK

user_id UUID UNIQUE FK

created_at TIMESTAMPTZ

One wishlist per customer.

# 34. wishlist_items

wishlist_items

--------------------------------

id UUID PK

wishlist_id UUID FK

product_id UUID FK

created_at TIMESTAMPTZ

Constraint:

UNIQUE(wishlist_id, product_id)

This prevents the same product from being added twice.

# 35. addresses

addresses

--------------------------------

id UUID PK

user_id UUID FK

label TEXT

full_name TEXT

phone TEXT

address_line TEXT

city TEXT

state TEXT

postal_code TEXT

country TEXT

is_default BOOLEAN

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

Customers can own multiple addresses.

V1 may use one address directly during checkout if a full address-management UI is not required.

# 36. orders

orders

--------------------------------

id UUID PK

user_id UUID FK

order_number TEXT UNIQUE

customer_name TEXT

customer_email TEXT

customer_phone TEXT

delivery_address TEXT

delivery_city TEXT

delivery_state TEXT

delivery_notes TEXT

subtotal_kobo BIGINT

delivery_fee_kobo BIGINT

total_kobo BIGINT

status TEXT

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

Customer information is intentionally snapshotted onto the order.

This prevents historical orders from changing when a customer later edits their profile.

# 37. order_items

order_items

--------------------------------

id UUID PK

order_id UUID FK

product_id UUID FK

product_name TEXT

product_price_kobo BIGINT

variant_id UUID NULL

variant_name TEXT NULL

quantity INTEGER

subtotal_kobo BIGINT

created_at TIMESTAMPTZ

The product name and price are snapshots.

# 38. newsletter_subscribers

newsletter_subscribers

--------------------------------

id UUID PK

email TEXT UNIQUE

created_at TIMESTAMPTZ

Newsletter subscription does not require authentication.

The public user can submit an email address.

Direct public reads must not be allowed.

# 39. order_email_logs

Recommended for tracking transactional email delivery.

order_email_logs

--------------------------------

id UUID PK

order_id UUID FK

recipient_type TEXT

recipient_email TEXT

status TEXT

provider_message_id TEXT

error_message TEXT NULL

sent_at TIMESTAMPTZ NULL

created_at TIMESTAMPTZ

Possible statuses:

pending

sent

failed

Possible recipient types:

customer

business

This allows the system to distinguish:

Order successfully created

from:

Order confirmation email successfully delivered

# 40. Entity Relationship Overview

auth.users

│

└── profiles

│

├── cart

│ └── cart_items

│ ├── products

│ └── product_variants

│

├── wishlists

│ └── wishlist_items

│ └── products

│

├── addresses

│

└── orders

│

├── order_items

│ ├── products

│ └── product_variants

│

└── order_email_logs

categories

│

└── products

│

├── product_images

└── product_variants

# 41. Database Constraints

Important constraints should be enforced at the database level.

Examples:

categories.slug UNIQUE

products.slug UNIQUE

products.sku UNIQUE

profiles.id REFERENCES auth.users(id)

cart.user_id UNIQUE

wishlists.user_id UNIQUE

newsletter_subscribers.email UNIQUE

orders.order_number UNIQUE

wishlist_items(wishlist_id, product_id) UNIQUE

Quantities must also be validated.

Examples:

quantity \> 0

stock_quantity \>= 0

price_kobo \>= 0

# 42. Database Indexing

Indexes should exist for frequently queried fields.

Recommended indexes:

products.slug

products.category_id

products.is_active

products.is_featured

products.is_best_seller

product_images.product_id

product_variants.product_id

cart.user_id

cart_items.cart_id

cart_items.product_id

wishlists.user_id

wishlist_items.wishlist_id

orders.user_id

orders.order_number

orders.status

orders.created_at

order_items.order_id

addresses.user_id

Do not create unnecessary indexes for every column.

# 43. Row Level Security

RLS must be enabled for all customer-owned tables.

## Profiles

Customer:

SELECT own profile

UPDATE own profile

Customer cannot access another customer's profile.

## Cart

Customer can:

SELECT own cart

INSERT own cart

UPDATE own cart

DELETE own cart

Cart items must only be accessible when their parent cart belongs to the authenticated user.

## Wishlist

Customer can:

SELECT own wishlist

INSERT own wishlist items

DELETE own wishlist items

## Addresses

Customer can only access their own addresses.

## Orders

Customer can:

SELECT own orders

Customer cannot:

UPDATE orders

DELETE orders

Order creation should occur through the controlled checkout process.

## Order Items

Customer can read order items belonging to their own orders.

**Products**

Public users may read:

active products

active categories

active product images

active product variants

Public users must not modify product data.

## Newsletter

Anonymous users may:

INSERT email

They must not:

SELECT subscribers

UPDATE subscribers

DELETE subscribers

# 44. Authentication Architecture

Authentication flow:

Customer

↓

Click "Continue with Google"

↓

Google OAuth

↓

Google authenticates user

↓

Supabase Auth creates session

↓

Auth callback

↓

Application establishes session

↓

Profile created/retrieved

↓

Customer enters application

# 45. Profile Creation

When a new user authenticates:

auth.users

↓

profile creation

↓

profiles

A database trigger can automatically create the corresponding profiles record.

Default:

role = customer

# 46. Authentication Protection

Protected routes:

/wishlist

/cart

/checkout

/account

/account/orders

If no authenticated user exists:

Protected page

↓

Redirect

↓

/login

After successful login, the customer should be returned to the intended destination where practical.

Example:

/checkout

↓

/login

↓

Google authentication

↓

/checkout

# 47. Authorization Architecture

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to access?

V1 customer role:

customer

Future roles:

admin

staff

Do not implement admin functionality in V1 merely because the database supports future roles.

# 48. Email Architecture

Order email flow:

Customer places order

↓

Order transaction succeeds

↓

Order ID returned

↓

Server loads order details

↓

Generate email content

↓

Send customer email

↓

Send business-owner email

↓

Record email result

Mailgun credentials must remain server-side.

# 49. Customer Order Email

Customer email should include:

- Greeting
- Order number
- Order date
- Purchased products
- Quantities
- Item prices
- Subtotal
- Delivery fee
- Total
- Delivery address
- Order status
- Store contact information

The email should not expose internal database identifiers unnecessarily.

# 50. Business Owner Order Email

Business-owner email should contain enough information to process the order.

Include:

- Order number
- Customer name
- Customer email
- Customer phone
- Products
- Quantities
- Prices
- Total
- Delivery address
- Delivery notes
- Order timestamp

# 51. Email Failure Handling

Email failure must not corrupt a successfully created order.

For example:

Order created

Customer email fails

The order remains valid.

The email failure should be logged.

This allows future retry functionality.

The system must distinguish:

Order creation failure

from:

Email delivery failure

# 52. Supabase Storage Architecture

Product images should be stored in Supabase Storage.

Suggested bucket:

product-images

Example storage structure:

product-images/

sofas/

cloud-sofa/

01.webp

02.webp

tables/

oak-side-table/

01.webp

The database stores the corresponding image path/URL.

# 53. Image Strategy

Prefer modern formats such as:

WebP

AVIF

where supported by the image pipeline.

Use Next.js Image for application-rendered product images.

Every product image should have meaningful alt text.

# 54. Cart Pricing Rules

The cart UI may display an estimated subtotal.

However, checkout must independently calculate:

Current product price

×

Requested quantity

The client must not submit:

total = ₦500,000

and expect the backend to trust it.

Instead:

Client:

"I want product X × 2"

Server:

"Current product price = X"

Server:

"2 × X = subtotal"

Server:

"subtotal + delivery = total"

# 55. Delivery Fee Architecture

V1 does not require a complex logistics engine.

The application should use a simple delivery-fee strategy.

The calculated delivery fee must be saved to:

orders.delivery_fee_kobo

This ensures that historical orders retain the delivery charge that applied when they were created.

If delivery pricing becomes more complex in V2, the architecture can be extended to support:

- State-based pricing
- City-based pricing
- Delivery zones
- Weight-based pricing
- Courier integration

# 56. Checkout Validation

Before creating an order, validate:

User authenticated?

Cart exists?

Cart contains items?

Products still active?

Variants still valid?

Requested quantities \> 0?

Requested quantities \<= stock?

Current prices available?

Customer information valid?

Delivery information valid?

If validation fails, do not create the order.

Return a useful error to the customer.

# 57. Stock Handling

For products without variants:

products.stock_quantity

is used.

For products with variants:

product_variants.stock_quantity

is used.

Stock must be checked during order creation.

Stock must be updated atomically with order creation.

# 58. Order Success Flow

After a successful order:

Checkout

↓

Order created

↓

Cart cleared

↓

Email process initiated

↓

Success page

Recommended route:

/account/orders/\[orderId\]

or a dedicated:

/checkout/success

that redirects the user to their order.

The success page must not trust an order ID supplied by an unauthenticated user.

# 59. Error Handling

The application should provide meaningful states.

## Product unavailable

"This product is currently unavailable."

## Out of stock

"This item is currently out of stock."

## Quantity exceeds stock

"Only 3 units are currently available."

## Authentication required

"Please sign in to continue."

## Checkout failure

"We couldn't place your order. Please review your cart and try again."

Do not expose raw database errors to customers.

# 60. Loading States

Important pages/components must have loading states.

Examples:

Product page

Product grid

Wishlist

Cart

Checkout

Orders

Order details

Use:

loading.tsx

Suspense

skeleton components

where appropriate.

# 61. Empty States

Important empty states include:

## Empty wishlist

Your wishlist is empty.

with:

Continue Shopping

## Empty cart

Your cart is empty.

with:

Start Shopping

## No orders

You haven't placed any orders yet.

with:

Shop Now

## No search results

No products found.

Provide a way to clear filters/search.

# 62. Validation

Use a schema validation library such as Zod for server-side validation.

Validate:

- Checkout information
- Newsletter email
- Cart quantities
- Search/filter parameters
- Product identifiers
- Address information

Validation should happen on the server even if the client also validates.

# 63. API / Server Action Strategy

Prefer Server Actions for internal application mutations where appropriate.

Examples:

addToCart()

removeFromCart()

updateCartQuantity()

addToWishlist()

removeFromWishlist()

subscribeToNewsletter()

createOrder()

Route Handlers may be used where an HTTP endpoint is more appropriate.

Examples:

/api/auth/...

/api/...

Do not create unnecessary API endpoints when a Server Action is sufficient.

# 64. Business Logic Separation

Business logic should not be buried inside React components.

Bad:

CheckoutForm.tsx

↓

calculate price

↓

update stock

↓

create order

↓

send email

Preferred:

CheckoutForm

↓

createOrder()

↓

Order Service

↓

Database Transaction

↓

Email Service

# 65. Recommended Library Structure

lib/

│

├── supabase/

│ ├── client.ts

│ ├── server.ts

│ └── middleware.ts

│

├── auth/

│ └── ...

│

├── products/

│ ├── queries.ts

│ └── types.ts

│

├── cart/

│ ├── actions.ts

│ └── queries.ts

│

├── wishlist/

│ ├── actions.ts

│ └── queries.ts

│

├── orders/

│ ├── actions.ts

│ ├── queries.ts

│ └── validation.ts

│

├── email/

│ ├── mailgun.ts

│ └── templates/

│

├── validation/

│ └── ...

│

├── pricing/

│ └── ...

│

└── utils/

└── ...

# 66. Component Architecture

Recommended structure:

components/

│

├── ui/

│

├── layout/

│

├── navigation/

│

├── home/

│

├── product/

│

├── category/

│

├── cart/

│

├── wishlist/

│

├── checkout/

│

├── account/

│

└── orders/

Components should have a single clear responsibility.

# 67. Recommended Project Structure

nestora/

│

├── app/

│ ├── account/

│ ├── auth/

│ ├── cart/

│ ├── categories/

│ ├── checkout/

│ ├── login/

│ ├── shop/

│ ├── wishlist/

│ ├── api/

│ ├── globals.css

│ ├── layout.tsx

│ └── page.tsx

│

├── components/

│ ├── ui/

│ ├── layout/

│ ├── navigation/

│ ├── home/

│ ├── product/

│ ├── cart/

│ ├── wishlist/

│ ├── checkout/

│ └── orders/

│

├── lib/

│ ├── supabase/

│ ├── auth/

│ ├── products/

│ ├── cart/

│ ├── wishlist/

│ ├── orders/

│ ├── email/

│ ├── validation/

│ ├── pricing/

│ └── utils/

│

├── supabase/

│ ├── migrations/

│ ├── seed.sql

│ └── functions/

│

├── public/

│

├── types/

│

├── middleware.ts

├── .env.local

├── .env.example

├── package.json

├── tsconfig.json

└── README.md

# 68. Environment Variables

Required configuration should be documented in .env.example.

Example:

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

MAILGUN_API_KEY=

MAILGUN_DOMAIN=

MAILGUN_FROM_EMAIL=

BUSINESS_OWNER_EMAIL=

SITE_URL=

Google OAuth credentials are configured through the appropriate Supabase/Google OAuth configuration rather than exposing the Google client secret to the browser.

Never commit .env.local.

# 69. Secrets Management

Never place secrets in:

components/

app/

public/

client-side JavaScript

GitHub

Do not prefix server-only secrets with:

NEXT_PUBLIC\_

unless the value is genuinely safe to expose publicly.

# 70. Google OAuth Configuration

The authentication architecture requires:

Google Cloud Console

↓

OAuth Client

↓

Supabase Google Provider

↓

Next.js

The OAuth redirect configuration must support:

Local development

Production

The production domain must be configured before deployment.

# 71. Security Requirements

The application must:

- Enable RLS
- Validate user ownership
- Validate all mutations
- Keep Mailgun credentials server-side
- Never trust client prices
- Never trust client totals
- Validate stock server-side
- Protect order access
- Protect customer data
- Avoid exposing database errors
- Avoid exposing sensitive environment variables

# 72. Database Migration Strategy

Database changes should be tracked through migrations.

Example:

supabase/migrations/

Migration files should be sequential and descriptive.

Example:

001_initial_schema.sql

002_rls_policies.sql

003_order_functions.sql

004_indexes.sql

005_seed_data.sql

Do not make undocumented manual production database changes.

# 73. Seed Data

V1 should include seed data for:

- Categories
- Products
- Product images
- Product variants where necessary
- Featured products
- Best sellers

Seed data allows development and testing without manually entering every product.

# 74. Type Generation

Supabase database types should be generated and used by TypeScript.

The goal is to maintain consistency between:

Database schema

↓

Generated types

↓

Application code

Avoid manually duplicating database models in multiple locations.

# 75. Performance Architecture

Priorities:

1.  Server-render public catalogue pages
2.  Optimize product images
3.  Avoid unnecessary client-side JavaScript
4.  Use pagination where catalogue size requires it
5.  Avoid N+1 database queries
6.  Fetch only required fields
7.  Cache appropriate public catalogue data
8.  Use indexed database queries

# 76. SEO Architecture

Public pages should have appropriate metadata.

Important pages:

Homepage

Shop

Category pages

Product pages

Product pages should provide:

- Product title
- Description
- Canonical URL
- Open Graph image
- Relevant metadata

Authenticated pages do not need to be indexed.

# 77. Accessibility

The application should target WCAG-conscious implementation.

Requirements include:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper form labels
- Accessible buttons
- Meaningful alt text
- Sufficient text contrast
- Error messages associated with fields
- No interaction that requires mouse-only behavior

# 78. Responsive Architecture

The application must support:

Mobile

Tablet

Desktop

Large desktop

Responsive behaviour should be designed from the beginning rather than added after desktop implementation.

Primary breakpoints should follow the Tailwind configuration unless the design system specifies otherwise.

# 79. Testing Architecture

V1 should include testing for critical business logic.

## Unit tests

Test:

- Price calculations
- Quantity validation
- Delivery calculation
- Formatting utilities
- Validation schemas

## Integration tests

Test:

- Cart operations
- Wishlist operations
- Database access
- Order creation
- RLS ownership

## End-to-end tests

Important journeys:

Browse products

↓

Product details

↓

Google login

↓

Add to wishlist

↓

Add to cart

↓

Checkout

↓

Create order

↓

View order

# 80. Logging

Server-side errors should be logged without exposing sensitive information.

Do not log:

- OAuth secrets
- Mailgun API keys
- Authentication tokens
- Passwords
- Sensitive customer information unnecessarily

Useful log events include:

order_created

order_creation_failed

email_sent

email_failed

authentication_error

database_error

# 81. Order Email Reliability

Order creation and email delivery are separate concerns.

Preferred sequence:

Database transaction

↓

Order successfully created

↓

Email service

↓

Email logs

An email failure should not cause the already-created order to disappear.

Future V2 can introduce:

background jobs

retry queues

webhooks

email retry processing

# 82. Architectural Boundaries

The following are intentionally excluded.

## No Admin Dashboard

There is no:

/admin

## No Payment Gateway

V1 does not integrate:

- Paystack
- Flutterwave
- Stripe
- PayPal
- Other payment processors

The checkout creates an order but does not process online payment.

## No Multi-vendor System

NESTORA is a single-store application.

## No Advanced Shipping Engine

No:

- Courier API
- Delivery tracking
- Shipping zones
- Automated delivery quotes

## No Coupon Engine

No:

- Promo codes
- Discount rules
- Coupon database

## No Multi-currency

V1 uses:

NGN

only.

# 88. Data Ownership Rules

The following ownership model must always be respected.

Public

├── Read active products

├── Read active categories

└── Subscribe to newsletter

Customer

├── Own profile

├── Own cart

├── Own wishlist

├── Own addresses

└── Own orders

System

├── Create orders

├── Calculate prices

├── Validate stock

├── Update stock

└── Send transactional emails

Future Admin

├── Manage products

├── Manage categories

├── Manage orders

└── Manage customers

# 89. Critical Business Rules

These rules must not be violated.

### Rule 1

The browser cannot determine the final order price.

### Rule 2

The browser cannot modify product stock.

### Rule 3

Customers cannot access other customers' orders.

### Rule 4

Customers cannot modify order status.

### Rule 5

Order items must preserve historical product information.

### Rule 6

Order creation must be atomic.

### Rule 7

Mailgun credentials must remain server-side.

### Rule 8

RLS must protect customer-owned data.

### Rule 9

Inactive products must not appear in public catalogue results.

### Rule 10

An order must not be created from an empty cart.

# 90. Definition of Architectural Completion

The V1 architecture is considered implemented when:

- Next.js App Router is configured
- TypeScript is enabled
- Tailwind CSS is configured
- Supabase project is connected
- Database schema is migrated
- RLS policies are active
- Google OAuth works
- Customer profiles are created
- Products can be retrieved
- Categories can be retrieved
- Product images can be retrieved
- Wishlist persists
- Cart persists
- Checkout validates data
- Orders are created atomically
- Stock is validated and updated
- Cart is cleared after successful order creation
- Customer orders are retrievable
- Customer order details are retrievable
- Mailgun sends customer confirmation
- Mailgun sends business-owner confirmation
- Email results are logged where implemented
- Newsletter subscriptions persist
- Protected routes are secured
- Production environment variables are configured
- Application can be deployed to Vercel

# 91. Architectural Source-of-Truth Rule

When implementing NESTORA, the following document hierarchy must be respected:

PRD.md

↓

Defines WHAT the product must do

Architecture.md

↓

Defines HOW the product is technically built

Style.md

↓

Defines HOW the interface should visually look

Taste.md

↓

Defines DESIGN / PRODUCT PREFERENCES

Agent.md

↓

Defines HOW THE AI CODING AGENT should operate

If an implementation decision conflicts with this document, the coding agent must not silently invent a new architecture.

It should identify the conflict and request clarification when the conflict materially affects the system.

# 92. Final Architecture Principle

NESTORA V1 should remain intentionally simple.

The goal is not to recreate every feature of Shopify.

The goal is to create a reliable custom e-commerce system with:

Modern storefront

\+

Persistent database

\+

Secure authentication

\+

Persistent cart

\+

Persistent wishlist

\+

Reliable checkout

\+

Persistent orders

\+

Transactional email

\+

Secure customer data

The architecture must prioritize:

**correctness → security → maintainability → performance → extensibility**

rather than prematurely introducing complex infrastructure.
