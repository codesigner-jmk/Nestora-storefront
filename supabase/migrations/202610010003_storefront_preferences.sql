-- Set the single standard delivery fee configured by the NESTORA owner: ₦6,500 = 650,000 kobo.
insert into public.store_settings (id, standard_delivery_fee_kobo)
values (true, 650000)
on conflict (id) do update
set standard_delivery_fee_kobo = excluded.standard_delivery_fee_kobo,
    updated_at = now();

-- The owner requested a manually selected opening Best Sellers collection.
-- No sales counts or other popularity metrics are created.
update public.products
set is_best_seller = true,
    updated_at = now()
where slug in (
  'moro-three-seat-sofa',
  'ayo-lounge-chair',
  'olu-dining-table',
  'nia-bed-frame'
)
and is_active = true;
