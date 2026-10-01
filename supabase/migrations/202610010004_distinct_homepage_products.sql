-- Keep the homepage's Best Sellers and Featured Products rows visually distinct.
-- The owner has chosen the opening Best Sellers selection manually.
update public.products
set is_best_seller = slug in (
      'moro-three-seat-sofa',
      'nia-bed-frame',
      'tola-dining-chair',
      'sola-two-seat-sofa'
    ),
    is_featured = slug in (
      'ayo-lounge-chair',
      'olu-dining-table',
      'lena-accent-chair',
      'kemi-bedside-table'
    ),
    updated_at = now()
where slug in (
  'moro-three-seat-sofa',
  'ayo-lounge-chair',
  'olu-dining-table',
  'nia-bed-frame',
  'lena-accent-chair',
  'tola-dining-chair',
  'sola-two-seat-sofa',
  'kemi-bedside-table'
);

-- Kemi previously reused the Nia bed image; give the bedside table a distinct photo.
update public.product_images
set image_url = 'https://images.unsplash.com/photo-1765766602624-861292c3bc8f?auto=format&fit=crop&w=1200&q=88',
    alt_text = 'Modern wooden bedside table with an open book in a softly lit bedroom'
where display_order = 0
  and product_id = (select id from public.products where slug = 'kemi-bedside-table');
