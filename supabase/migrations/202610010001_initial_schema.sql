create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'customer' check (role = 'customer'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null,
  price_kobo bigint not null check (price_kobo >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text not null unique,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, display_order)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  price_modifier_kobo bigint not null default 0,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, name, value)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (cart_id, product_id, variant_id)
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null check (length(trim(recipient_name)) between 2 and 120),
  phone text not null check (length(trim(phone)) between 7 and 30),
  address_line text not null check (length(trim(address_line)) between 5 and 300),
  city text not null check (length(trim(city)) between 2 and 100),
  state text not null check (length(trim(state)) between 2 and 100),
  delivery_notes text check (delivery_notes is null or length(delivery_notes) <= 500),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_settings (
  id boolean primary key default true check (id),
  standard_delivery_fee_kobo bigint check (standard_delivery_fee_kobo is null or standard_delivery_fee_kobo >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_city text not null,
  delivery_state text not null,
  delivery_notes text,
  subtotal_kobo bigint not null check (subtotal_kobo >= 0),
  delivery_fee_kobo bigint not null check (delivery_fee_kobo >= 0),
  total_kobo bigint not null check (total_kobo = subtotal_kobo + delivery_fee_kobo),
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_price_kobo bigint not null check (product_price_kobo >= 0),
  product_image_url text,
  variant_id uuid references public.product_variants(id) on delete set null,
  variant_name text,
  quantity integer not null check (quantity > 0),
  subtotal_kobo bigint not null check (subtotal_kobo >= 0),
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (length(email) <= 254 and email = lower(trim(email)) and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  created_at timestamptz not null default now()
);

create table public.order_email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  recipient_type text not null check (recipient_type in ('customer','owner')),
  recipient_email text not null,
  status text not null check (status in ('sent','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_active_idx on public.products(is_active);
create index products_featured_idx on public.products(is_featured) where is_active;
create index products_best_seller_idx on public.products(is_best_seller) where is_active;
create index product_images_product_idx on public.product_images(product_id, display_order);
create index product_variants_product_idx on public.product_variants(product_id);
create index cart_items_cart_idx on public.cart_items(cart_id);
create index wishlist_items_wishlist_idx on public.wishlist_items(wishlist_id);
create index addresses_user_idx on public.addresses(user_id);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index order_items_order_idx on public.order_items(order_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.addresses enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.order_email_logs enable row level security;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public reads product images" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');

create policy "Public reads active categories" on public.categories for select to anon, authenticated using (is_active);
create policy "Public reads active products" on public.products for select to anon, authenticated using (is_active);
create policy "Public reads images for active products" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.is_active));
create policy "Public reads variants for active products" on public.product_variants for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.is_active));
create policy "Public reads store settings" on public.store_settings for select to anon, authenticated using (true);

create policy "Customers read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Customers update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = 'customer');
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, phone) on public.profiles to authenticated;

create policy "Customers manage own cart" on public.carts for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Customers manage items in own cart" on public.cart_items for all to authenticated using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid()))) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));
create policy "Customers manage own wishlist" on public.wishlists for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Customers manage items in own wishlist" on public.wishlist_items for all to authenticated using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = (select auth.uid()))) with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = (select auth.uid())));
create policy "Customers manage own addresses" on public.addresses for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Customers read own orders" on public.orders for select to authenticated using (user_id = (select auth.uid()));
create policy "Customers read items from own orders" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers for insert to anon, authenticated with check (email = lower(trim(email)));
create policy "Customers cannot read email logs" on public.order_email_logs for select to authenticated using (false);

insert into public.store_settings (id, standard_delivery_fee_kobo)
values (true, null);

insert into public.categories (id, name, slug, description, image_url) values
('10000000-0000-4000-8000-000000000001','Sofas','sofas','Comfortable centrepieces for the living room.','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85'),
('10000000-0000-4000-8000-000000000002','Chairs','chairs','A place to sit, read, gather and stay a while.','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85'),
('10000000-0000-4000-8000-000000000003','Dining','dining','Furniture for dinners that last a little longer.','https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=85'),
('10000000-0000-4000-8000-000000000004','Beds','beds','Quiet, considered pieces for a restful room.','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85');

-- Initial proposed NESTORA catalogue. Adjust stock, prices, descriptions and images to match actual sourcing before accepting customer orders.
insert into public.products (category_id, name, slug, description, price_kobo, stock_quantity, sku, is_active, is_featured, is_best_seller) values
('10000000-0000-4000-8000-000000000001','Moro Three-Seat Sofa','moro-three-seat-sofa','A low, generous sofa with softly rounded arms and a relaxed profile. A hardwood frame pairs with warm, textured linen-blend upholstery. Approx. 225 × 92 × 82 cm. Made for unhurried evenings and everyday use.',48500000,4,'NES-SOF-001',true,true,false),
('10000000-0000-4000-8000-000000000002','Ayo Lounge Chair','ayo-lounge-chair','A sculptural lounge chair with a gently reclined back and a solid ash frame. A woven neutral seat balances the warm timber. Approx. 76 × 82 × 78 cm. Its proportions make a quiet corner feel complete.',19800000,6,'NES-CHR-001',true,true,false),
('10000000-0000-4000-8000-000000000003','Olu Dining Table','olu-dining-table','A solid oak dining table with a softly finished surface and grounded, architectural legs. At 180 × 90 × 76 cm, it seats six comfortably. Made to bring people together around an unhurried meal.',36500000,3,'NES-DIN-001',true,true,false),
('10000000-0000-4000-8000-000000000004','Nia Bed Frame','nia-bed-frame','A calm, upholstered bed frame with a softly padded headboard and a clean, low silhouette. Sized for a 160 × 200 cm mattress, with a hardwood frame and neutral woven upholstery. An easy foundation for a more restful bedroom.',42500000,3,'NES-BED-001',true,false,false),
('10000000-0000-4000-8000-000000000002','Lena Accent Chair','lena-accent-chair','A compact accent chair with a curved back and tactile woven upholstery. At approx. 70 × 75 × 78 cm, it suits a reading nook, bedroom or thoughtful pair in the living room.',15500000,5,'NES-CHR-002',true,true,false),
('10000000-0000-4000-8000-000000000003','Tola Dining Chair','tola-dining-chair','A supportive dining chair in solid ash with a gently curved backrest and a woven seat. Approx. 50 × 54 × 79 cm. Considered detailing keeps it at home around a full dining table or a small breakfast nook.',8900000,8,'NES-DIN-002',true,false,false),
('10000000-0000-4000-8000-000000000001','Sola Two-Seat Sofa','sola-two-seat-sofa','A compact two-seat sofa with a clean hardwood frame, deep seat and softly structured linen-blend cushions. Approx. 180 × 90 × 82 cm. A considered fit for smaller living rooms and relaxed conversation.',34500000,4,'NES-SOF-002',true,false,false),
('10000000-0000-4000-8000-000000000004','Kemi Bedside Table','kemi-bedside-table','A compact bedside table in warm oak with a quiet drawer front and a useful open shelf. At 48 × 40 × 52 cm, it keeps everyday essentials close without crowding the room.',9750000,7,'NES-BED-002',true,true,false);

insert into public.product_images (product_id, image_url, alt_text, display_order)
select p.id, i.image_url, i.alt_text, 0
from (values
  ('moro-three-seat-sofa','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=88','Neutral three-seat sofa in a warm, natural living room'),
  ('ayo-lounge-chair','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=88','Sculptural lounge chair with a timber frame'),
  ('olu-dining-table','https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=88','Oak dining table arranged in a calm dining room'),
  ('nia-bed-frame','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=88','Softly dressed bed in a quiet neutral bedroom'),
  ('lena-accent-chair','https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=1200&q=88','Accent chair with a curved upholstered back'),
  ('tola-dining-chair','https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=88','Modern wooden dining chair in a bright interior'),
  ('sola-two-seat-sofa','https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=1200&q=88','Compact two-seat sofa in a light living room'),
  ('kemi-bedside-table','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=88','Warm wood bedside table beside a made bed')
) as i(slug,image_url,alt_text)
join public.products p on p.slug = i.slug;
