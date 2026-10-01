-- Add eight proposed catalogue products across distinct furniture types.
-- Prices and stock are initial catalogue values; confirm sourcing and inventory before launch.

insert into public.categories (name, slug, description, image_url)
values
  ('Tables', 'tables', 'Useful surfaces for gathering, working and living.', 'https://images.unsplash.com/photo-1560184897-ad57012c0981?auto=format&fit=crop&w=900&q=85'),
  ('Storage', 'storage', 'Considered storage for the things that make a room yours.', 'https://images.unsplash.com/photo-1773810773827-91cd658820a9?auto=format&fit=crop&w=900&q=85'),
  ('Lighting', 'lighting', 'Warm light for slower evenings and everyday rituals.', 'https://images.unsplash.com/photo-1675767528117-963ce219b52a?auto=format&fit=crop&w=900&q=85')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    image_url = excluded.image_url,
    is_active = true,
    updated_at = now();

with new_products (name, slug, description, price_kobo, stock_quantity, sku, category_slug) as (
  values
    ('Abeni Coffee Table', 'abeni-coffee-table', 'A softly rounded coffee table in warm-toned wood, with a generous surface for books, trays and everyday living. Approx. 110 × 60 × 42 cm.', 14500000::bigint, 5, 'NES-TBL-001', 'tables'),
    ('Teni Upholstered Ottoman', 'teni-upholstered-ottoman', 'A compact upholstered ottoman with a supportive, softly cushioned top. Use it as a footrest, an extra seat or a finishing touch beside a lounge chair. Approx. 60 × 45 × 42 cm.', 8900000::bigint, 6, 'NES-CHR-003', 'chairs'),
    ('Duro Media Console', 'duro-media-console', 'A low media console in natural wood with a calm, practical profile for living rooms. Its broad top and enclosed storage keep essentials close and considered. Approx. 160 × 42 × 55 cm.', 28500000::bigint, 3, 'NES-STO-001', 'storage'),
    ('Sade Bookcase', 'sade-bookcase', 'An open bookcase with clean lines and generous shelves for books, collected objects and framed photographs. Approx. 90 × 32 × 180 cm.', 22000000::bigint, 4, 'NES-STO-002', 'storage'),
    ('Eko Sideboard', 'eko-sideboard', 'A refined sideboard with a warm wood finish and glass-front storage for dining pieces and keepsakes. Approx. 140 × 42 × 82 cm.', 39500000::bigint, 2, 'NES-STO-003', 'storage'),
    ('Ire Floor Lamp', 'ire-floor-lamp', 'A slender floor lamp that brings a warm pool of light to a reading corner or living room. Approx. 155 cm tall; bulb not included.', 9500000::bigint, 8, 'NES-LGT-001', 'lighting'),
    ('Kora Writing Desk', 'kora-writing-desk', 'A thoughtfully proportioned wooden desk with room for a laptop, notebook and a quiet hour of focused work. Approx. 120 × 60 × 75 cm.', 24500000::bigint, 4, 'NES-TBL-002', 'tables'),
    ('Bisi Entry Bench', 'bisi-entry-bench', 'A simple solid-wood bench for an entryway, bedroom or reading nook. Its compact footprint offers a useful place to pause and set things down. Approx. 100 × 38 × 45 cm.', 11000000::bigint, 5, 'NES-CHR-004', 'chairs')
)
insert into public.products (category_id, name, slug, description, price_kobo, stock_quantity, sku, is_active, is_featured, is_best_seller)
select c.id, p.name, p.slug, p.description, p.price_kobo, p.stock_quantity, p.sku, true, false, false
from new_products p
join public.categories c on c.slug = p.category_slug
on conflict (slug) do update
set category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_kobo = excluded.price_kobo,
    stock_quantity = excluded.stock_quantity,
    sku = excluded.sku,
    is_active = true,
    updated_at = now();

with product_photos (slug, image_url, alt_text) as (
  values
    ('abeni-coffee-table', 'https://images.unsplash.com/photo-1560184897-ad57012c0981?auto=format&fit=crop&w=1200&q=88', 'Warm wooden coffee table in a natural living room'),
    ('teni-upholstered-ottoman', 'https://images.unsplash.com/photo-1737712374558-0e4984a728f0?auto=format&fit=crop&w=1200&q=88', 'Soft upholstered ottoman in a bright, considered living room'),
    ('duro-media-console', 'https://images.unsplash.com/photo-1730131434819-084da0348b25?auto=format&fit=crop&w=1200&q=88', 'Wooden media console styled in a sunlit living room'),
    ('sade-bookcase', 'https://images.unsplash.com/photo-1620388640952-35a1d22d158d?auto=format&fit=crop&w=1200&q=88', 'White wood bookcase with books in a calm living room'),
    ('eko-sideboard', 'https://images.unsplash.com/photo-1773810773827-91cd658820a9?auto=format&fit=crop&w=1200&q=88', 'Modern sideboard with glass doors and considered styling'),
    ('ire-floor-lamp', 'https://images.unsplash.com/photo-1675767528117-963ce219b52a?auto=format&fit=crop&w=1200&q=88', 'Floor lamp bringing warm light to a relaxed living room'),
    ('kora-writing-desk', 'https://images.unsplash.com/photo-1759986452774-be47f7db2362?auto=format&fit=crop&w=1200&q=88', 'Wooden writing desk in a naturally lit workspace'),
    ('bisi-entry-bench', 'https://images.unsplash.com/photo-1758414335298-7afde83e12ea?auto=format&fit=crop&w=1200&q=88', 'Natural wood bench in a thoughtfully styled interior')
)
insert into public.product_images (product_id, image_url, alt_text, display_order)
select p.id, ph.image_url, ph.alt_text, 0
from product_photos ph
join public.products p on p.slug = ph.slug
on conflict (product_id, display_order) do update
set image_url = excluded.image_url,
    alt_text = excluded.alt_text;
