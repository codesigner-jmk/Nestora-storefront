# 1. Product Overview

NESTORA is a modern furniture and home-goods e-commerce website where customers can browse products, explore categories, save products to a wishlist, add products to a shopping cart, authenticate using Google, place orders, and view their previous orders.

The application is intended to provide a polished, trustworthy shopping experience similar in structure to a modern Shopify storefront, while the underlying commerce functionality is custom-built.

The V1 application is **customer-facing only**.

An administrative dashboard will **not** be implemented in V1. It may be introduced in a future version if required.

# 2. Business Concept

### Brand

**NESTORA**

### Positioning

Modern furniture for modern living.

### Product category

Furniture and selected home products.

### Example product categories

- Sofas
- Beds
- Dining
- Tables
- Chairs
- Storage
- Lighting
- Home Decor

These categories can be adjusted during implementation.

# 3. Product Goal

The primary goal is to create a functional e-commerce experience that allows a customer to:

> Discover → Evaluate → Save → Purchase → Receive confirmation → Return and view previous orders.

The system must persist important customer and commerce data in a database rather than relying on temporary frontend state.

# 4. Objectives

This must demonstrate that the application can:

1.  Present a professional furniture storefront.
2.  Retrieve and display products from a database.
3.  Organize products into categories.
4.  Allow customers to search for products.
5.  Allow customers to filter and sort products.
6.  Display detailed product information.
7.  Allow authenticated customers to maintain a wishlist.
8.  Allow customers to add products to a persistent cart.
9.  Allow customers to complete checkout.
10. Create and persist orders.
11. Associate orders with the correct customer.
12. Allow customers to view their previous orders.
13. Allow customers to view individual order details.
14. Authenticate customers through Google.
15. Send order confirmation emails to both the customer and business owner.
16. Protect customer-specific data using database-level authorization.
17. Provide a responsive experience across desktop, tablet and mobile.

# 5. Scope

## Included

### Storefront

- Homepage
- Product catalogue
- Product categories
- Product search
- Product filtering
- Product sorting
- Product detail pages
- Wishlist
- Shopping cart
- Checkout
- Order confirmation
- Customer account
- Order history
- Individual order details
- Google authentication
- Newsletter signup
- Transactional emails

### Backend

- Supabase PostgreSQL database
- Supabase authentication
- Supabase storage for product images
- Supabase Row Level Security
- Order persistence
- Cart persistence
- Wishlist persistence
- Customer profiles
- Mailgun email integration

### Authentication

- Google OAuth
- Authenticated customer sessions
- Protected account pages

# 6. Explicitly Out of Scope

The following will NOT be implemented unless requirements change:

- Admin dashboard
- Product management dashboard
- Customer management dashboard
- Order management dashboard
- Multiple vendors
- Marketplace functionality
- Real payment gateway
- Complex discount engine
- Coupon management
- Advanced shipping management
- Multi-currency
- Multi-language
- AI product recommendations
- Abandoned-cart automation
- Advanced analytics
- Inventory management dashboard

The database should, however, be designed so that these features can be added later without rebuilding the entire system.

# 7. Homepage

The homepage must follow this section order:

## 7.1 Hero

Purpose:

Immediately communicate what NESTORA sells and establish the brand's visual identity.

Potential content:

- Primary headline
- Supporting copy
- Primary CTA
- Secondary CTA
- Lifestyle/product imagery

Example CTA:

> Shop Furniture

Secondary CTA:

> Explore Collection

## 7.2 Featured Categories

Display major product categories.

Example:

- Sofas
- Beds
- Dining
- Tables
- Chairs
- Decor

Each category should link to its corresponding category/product listing.

## 7.3 Best Sellers

Display products identified as best sellers.

Products may be flagged as best sellers through database fields rather than manually hardcoded into the frontend.

Each product card should support:

- Product image
- Product name
- Price
- Wishlist control
- Product link
- Add-to-cart action where appropriate

## 7.4 Promotional Section

A visually prominent promotional area.

Possible content:

- Seasonal campaign
- New collection
- Limited offer
- Free delivery campaign
- Furniture collection launch

## 7.5 Featured Products

Display products specifically selected as featured.

This is separate from Best Sellers.

**Best Sellers** communicate popularity.

**Featured Products** communicate products the business wants to highlight.

## 7.6 Trust Stripe

A horizontal trust/value section.

Possible items:

- Quality Furniture
- Secure Shopping
- Reliable Delivery
- Customer Support

## 7.7 Why Shop With Us

Explain the value proposition of NESTORA.

Potential themes:

- Quality materials
- Modern designs
- Reliable delivery
- Customer-focused service
- Carefully selected furniture

## 7.8 Newsletter

Allow visitors/customers to subscribe to the NESTORA newsletter.

Required information:

- Email address

The system should prevent duplicate subscriptions.

## 7.9 Footer

The footer should contain relevant navigation and business information.

Possible sections:

**Shop**

- All Products
- Sofas
- Beds
- Dining
- Decor

**Customer**

- My Account
- My Orders
- Wishlist
- Cart

**Company**

- About
- Contact
- FAQs

**Legal**

- Privacy Policy
- Terms & Conditions

Social links may also be included.

# 8. Product Catalogue

Route:

/shop

The catalogue must retrieve products from Supabase.

## Required functionality

### Search

Customers should be able to search products.

Example:

> "cream sofa"

The search should query relevant product information.

### Filtering

Potential filters:

- Category
- Price range
- Availability
- Product attributes

### Sorting

Potential options:

- Featured
- Best Selling
- Price: Low to High
- Price: High to Low
- Newest

**9. Product Card**

Each product card should provide enough information for the customer to identify and evaluate the product.

Required:

- Product image
- Product name
- Price
- Wishlist button
- Product link

Optional:

- Discount/badge
- Category
- Rating
- Availability
- Quick Add

# 10. Product Detail Page

Route:

/shop/\[product\]

The product page must contain:

### Product information

- Product name
- Price
- Product description
- Product images
- Category
- Stock/availability
- Product variants where applicable

### Customer actions

- Select variant
- Select quantity
- Add to cart
- Add/remove wishlist

### Supporting information

Potential sections:

- Product details
- Dimensions
- Materials
- Delivery information
- Care instructions
- Related products

# 11. Wishlist

Route:

/wishlist

Wishlist functionality requires authentication.

Customers can:

- Add a product
- Remove a product
- View saved products
- Add a saved product to cart

Wishlist data must persist in Supabase.

A customer's wishlist must remain available after they log out and return later.

# 12. Shopping Cart

Route:

/cart

The cart must persist for authenticated customers.

Each cart item should contain:

- Product
- Quantity
- Unit price
- Selected variant where applicable
- Subtotal

Customers can:

- Increase quantity
- Decrease quantity
- Remove item
- Continue shopping
- Proceed to checkout

The cart should calculate:

Subtotal

\+ Delivery fee

= Total

The final amount must be calculated securely rather than trusting totals submitted by the browser.

# 13. Authentication

Authentication will use:

**Supabase Auth + Google OAuth**

The customer should be able to authenticate using Google.

Authentication architecture:

Customer

↓

Google

↓

Google OAuth

↓

Supabase Auth

↓

Authenticated Session

↓

Customer Profile

Google OAuth credentials will be configured through Google Cloud Console.

# 14. Customer Account

Route:

/account

The account area should provide access to:

- Profile
- Orders
- Wishlist
- Account-related navigation
- Logout

Authenticated routes must not be accessible to unauthenticated users.

# 15. Orders

## 15.1 Order Creation

When the customer completes checkout:

1.  Validate the authenticated customer.
2.  Validate the cart.
3.  Retrieve current product information.
4.  Verify product availability.
5.  Calculate the order amount.
6.  Create the order.
7.  Create associated order items.
8.  Store customer/delivery information.
9.  Clear the customer's cart.
10. Send confirmation emails.
11. Display order confirmation.

# 16. Order Status

V1 should support basic order statuses.

Suggested statuses:

pending

confirmed

processing

shipped

delivered

cancelled

The initial order status after successful checkout should be:

**pending** or **confirmed**, depending on the final business flow.

Because there is no admin dashboard in V1, status changes will not be managed through the website yet.

The database should nevertheless support them for future development.

# 17. Customer Orders Page

Route:

/account/orders

Customers can view orders they have previously placed.

Each order summary should display:

- Order number
- Order date
- Number of items
- Total
- Current status
- View order button

Example:

My Orders

Order \#NES-00124

October 1, 2026

3 items

₦450,000

Status: Confirmed

\[View Order\]

# 18. Individual Order Page

Route:

/account/orders/\[orderId\]

The customer should be able to see:

### Order information

- Order number
- Order date
- Order status

### Products

- Product name
- Product image
- Quantity
- Unit price
- Item subtotal

### Financial information

- Subtotal
- Delivery fee
- Total

### Customer information

- Name
- Email
- Phone number
- Delivery address

Customers must only be able to access their own orders.

# 19. Checkout

Route:

/checkout

The checkout page should collect the information required to fulfil an order.

Potential information:

### Customer

- Name
- Email
- Phone number

### Delivery

- Address
- City
- State
- Additional delivery instructions

### Order summary

- Products
- Quantities
- Subtotal
- Delivery fee
- Total

### Final action

> Place Order

this does not include real payment processing

# 20. Order Confirmation

After successfully placing an order, the customer should see an order-success page.

Example:

Order Confirmed

Thank you for your order.

Order \#NES-00124

We've sent a confirmation email to

customer@email.com

\[View My Order\]

\[Continue Shopping\]

# 21. Email System

Email delivery will use:

**Mailgun**

Two confirmation emails must be sent after a successful order.

### Customer email

Recipient:

> Customer's authenticated/checkout email

Purpose:

> Confirm that the customer's order was successfully received.

### Business-owner email

Recipient:

> NESTORA business-owner email configured in environment variables.

Purpose:

> Notify the business owner that a new order has been placed.

# 22. Customer Order Email

The customer email should contain:

- NESTORA branding
- Order number
- Order date
- Purchased products
- Quantities
- Prices
- Subtotal
- Delivery fee
- Total
- Delivery information
- Customer information
- Link to view the order

# 23. Business Owner Email

The business-owner notification should contain:

- New order notification
- Order number
- Customer name
- Customer email
- Customer phone
- Delivery address
- Products purchased
- Quantities
- Order total
- Order date

Example subject:

> New NESTORA Order — \#NES-00124

# 24. Newsletter

The homepage newsletter form should collect:

- Email address

The system should:

- Validate email
- Prevent duplicates
- Persist subscription information
- Provide appropriate success/error feedback

A dedicated newsletter_subscribers table should be considered.

# 25. Database Architecture

Supabase PostgreSQL will be the primary database.

Initial tables:

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

# 26. Profiles

Suggested fields:

id

email

full_name

avatar_url

phone

role

created_at

updated_at

The id should correspond to the authenticated Supabase user.

For V1, the default role should be:

customer

# 27. Categories

Suggested fields:

id

name

slug

description

image_url

is_active

created_at

updated_at

# 28. Products

Suggested fields:

id

category_id

name

slug

description

price

stock_quantity

sku

is_active

is_featured

is_best_seller

created_at

updated_at

# 29. Product Images

Suggested fields:

id

product_id

image_url

alt_text

display_order

created_at

Product images will be stored in Supabase Storage.

The database stores references/URLs.

# 30. Product Variants

Suggested fields:

id

product_id

name

value

price_modifier

stock_quantity

sku

created_at

updated_at

This allows products to have attributes such as:

Colour:

Cream

Grey

Brown

Size:

2-Seater

3-Seater

L-Shape

The exact variant model can be refined during database implementation.

# 31. Cart

Suggested fields:

id

user_id

created_at

updated_at

## Cart Items

id

cart_id

product_id

variant_id

quantity

created_at

updated_at

# 32. Wishlist

Suggested fields:

id

user_id

created_at

## Wishlist Items

id

wishlist_id

product_id

created_at

A user should not be able to add the same product to their wishlist multiple times.

# 33. Orders

Suggested fields:

id

user_id

order_number

customer_name

customer_email

customer_phone

delivery_address

delivery_city

delivery_state

delivery_notes

subtotal

delivery_fee

total

status

created_at

updated_at

# 34. Order Items

Suggested fields:

id

order_id

product_id

product_name

product_price

variant_id

variant_name

quantity

subtotal

created_at

The order item should store a snapshot of important product information.

This is important because a product's price or name may change later.

For example:

Product today:

Luna Sofa

₦450,000

Order placed:

₦450,000

Later product price:

₦500,000

The old order must still show:

> ₦450,000

rather than dynamically reading the new product price.

# 35. Newsletter Subscribers

Suggested fields:

id

email

created_at

The email should have a uniqueness constraint.

# 36. Supabase Storage

Supabase Storage will be used for product images.

Conceptually:

product-images/

sofas/

beds/

tables/

chairs/

decor/

The application retrieves the corresponding image URL from the database.

# 37. Security Requirements

Security is a core requirement of the application.

## Authentication

Authenticated functionality must require a valid Supabase session.

## Authorization

Customers can only access their own:

- Profile
- Cart
- Wishlist
- Orders
- Addresses

## Row Level Security

Supabase RLS policies must protect customer-specific data.

Example:

Customer A

↓

Can access Customer A's orders

Customer B

↓

Cannot access Customer A's orders

The frontend must never be treated as the primary security boundary.

# 38. Secrets

Sensitive credentials must never be exposed in client-side code.

Examples:

MAILGUN_API_KEY

MAILGUN_DOMAIN

MAILGUN credentials

Supabase server/secret credentials

Google OAuth secrets

These must be stored as environment variables/server-side secrets.

# 39. Technical Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend / Database

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase RLS

## Authentication

- Google OAuth
- Google Cloud Console
- Supabase Auth

## Email

- Mailgun

## Deployment

- Vercel
- Supabase
- Mailgun

## Version Control

- Git
- GitHub

# 40. Suggested Application Architecture

NESTORA

│

▼

Next.js App

│

┌──────────────┼──────────────┐

│ │ │

▼ ▼ ▼

Storefront Account Checkout

│ │ │

└──────────────┼──────────────┘

│

▼

Supabase

│

┌──────────────┼──────────────┐

│ │ │

▼ ▼ ▼

PostgreSQL Auth Storage

│

▼

Products / Users / Cart /

Wishlist / Orders

│

▼

Mailgun

│

┌─────────┴─────────┐

▼ ▼

Customer Owner

Email Email

# 41. Core User Journey

The primary V1 journey is:

Homepage

↓

Browse products

↓

Product details

↓

Add to wishlist / cart

↓

Cart

↓

Checkout

↓

Place order

↓

Order created

↓

Confirmation emails

↓

Order success

↓

My Orders

↓

View Order

# 42. Authentication Journey

Login

↓

Continue with Google

↓

Google OAuth

↓

Supabase authentication

↓

User session

↓

Customer profile

↓

Account

# 43. Wishlist Journey

Product

↓

Add to Wishlist

↓

Supabase

↓

Wishlist

↓

View Wishlist

↓

Add to Cart

# 44. Order Journey

Cart

↓

Checkout

↓

Customer information

↓

Delivery information

↓

Review order

↓

Place Order

↓

Validate

↓

Create Order

↓

Create Order Items

↓

Clear Cart

↓

Send Customer Email

↓

Send Owner Email

↓

Order Success

# 45. Error Handling

The application should provide useful feedback for:

- Failed authentication
- Invalid email
- Product unavailable
- Insufficient stock
- Empty cart
- Checkout validation errors
- Failed order creation
- Failed email delivery
- Network/database errors

Users should not see raw database or server errors.

# 46. Loading States

The application should provide appropriate loading states for:

- Product retrieval
- Search
- Filtering
- Authentication
- Wishlist actions
- Cart actions
- Checkout
- Order creation
- Order history
- Order detail retrieval

Skeleton loaders may be used for product/catalogue sections.

# 47. Empty States

Important empty states include:

### Empty cart

> Your cart is empty.

CTA:

> Continue Shopping

### Empty wishlist

> You haven't saved any products yet.

CTA:

> Explore Products

### No orders

> You haven't placed any orders yet.

CTA:

> Start Shopping

### No search results

> We couldn't find any products matching your search.

CTA:

> Browse All Products

# 48. Responsive Design

The website must support:

- Desktop
- Laptop
- Tablet
- Mobile

The mobile experience must not simply be a compressed desktop layout.

Navigation, product grids, checkout and account pages should be deliberately designed for smaller screens.

# 49. Performance Requirements

The application should:

- Optimize product images
- Lazy-load non-critical images
- Avoid unnecessary database queries
- Use appropriate caching/revalidation where appropriate
- Avoid loading the entire product catalogue unnecessarily
- Keep client-side JavaScript reasonable

# 50. Accessibility

The application should include:

- Semantic HTML
- Keyboard-accessible controls
- Visible focus states
- Meaningful image alt text
- Accessible form labels
- Sufficient contrast
- Accessible error messages
- Proper button/link semantics

# 51. Acceptance Criteria

The V1 will be considered functionally complete when:

### Storefront

- Homepage displays all required sections in the specified order.
- Products are retrieved from Supabase.
- Categories are retrieved from Supabase.
- Product pages display database information.
- Search works.
- Filtering works.
- Sorting works.

### Authentication

- Customer can authenticate with Google.
- Authenticated session persists appropriately.
- Protected pages require authentication.
- Customer can log out.

### Wishlist

- Customer can add products to wishlist.
- Customer can remove products.
- Wishlist persists in Supabase.
- Wishlist is associated with the correct customer.
- Customer can add wishlist products to cart.

### Cart

- Customer can add products.
- Customer can change quantities.
- Customer can remove products.
- Cart persists.
- Cart totals are calculated correctly.

### Checkout

- Customer can enter required information.
- Empty/invalid checkout submissions are rejected.
- Product availability is validated.
- Order total is calculated securely.
- Order is stored in Supabase.

### Orders

- Each order receives a unique order number.
- Order items are stored.
- Customer can see their orders.
- Customer can view an individual order.
- Customer cannot access another customer's order.

### Email

- Customer receives order confirmation email.
- Business owner receives order notification email.
- Email contains accurate order information.

### Security

- RLS policies protect customer data.
- Secrets are not exposed to the client.
- Unauthorized users cannot access protected resources.

# 52. Future V2 Direction

The architecture should leave room for:

V2

│

├── Admin Dashboard

├── Product Management

├── Order Management

├── Customer Management

├── Inventory Management

├── Order Status Updates

└── Email Status Notifications

Potential later versions could introduce:

V3

│

├── Payment Gateway

├── Coupons

├── Reviews

├── Product Recommendations

├── Advanced Analytics

├── Delivery Tracking

└── Abandoned Cart

This ensures V1 remains manageable while avoiding architectural decisions that would prevent future expansion.

# 53. Definition of Done

NESTORA V1 is complete when a new customer can:

**Discover**

→ Visit the homepage  
→ Browse categories  
→ Search/filter products  
→ View product details

**Save**

→ Sign in with Google  
→ Add products to wishlist  
→ View wishlist

**Shop**

→ Add products to cart  
→ Modify cart  
→ Proceed to checkout

**Order**

→ Provide delivery information  
→ Place an order  
→ Have the order persisted in Supabase

**Confirm**

→ Receive an order confirmation email

**Business notification**

→ Have the business owner receive the same order notification

**Return**

→ Log in later  
→ Open My Orders  
→ View previous orders  
→ Open individual order details

The application must perform these functions reliably while protecting customer data through authentication and database-level authorization.

# 54. Final V1 Product Definition

> **NESTORA is a customer-facing furniture e-commerce web application that allows customers to discover furniture, authenticate with Google, save products to a wishlist, manage a persistent shopping cart, place orders, receive email confirmations, and view their previous orders.**
>
> **Supabase provides the database, authentication, storage and database security layer. Google Cloud provides the OAuth credentials for Google authentication. Mailgun handles transactional order emails.**
