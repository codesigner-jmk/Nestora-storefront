create or replace function public.create_order_from_cart(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_address text,
  p_delivery_city text,
  p_delivery_state text,
  p_delivery_notes text default null
)
returns table (id uuid, order_number text, subtotal_kobo bigint, delivery_fee_kobo bigint, total_kobo bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_fee bigint;
  v_subtotal bigint := 0;
  v_total bigint;
  v_order_id uuid;
  v_order_number text;
  v_item record;
  v_variant record;
  v_unit_price bigint;
  v_stock integer;
  v_image_url text;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if length(trim(p_customer_name)) not between 2 and 120 then raise exception 'invalid_customer_details'; end if;
  if length(trim(p_customer_email)) not between 5 and 254 or trim(p_customer_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid_customer_details'; end if;
  if length(trim(p_customer_phone)) not between 7 and 30 then raise exception 'invalid_customer_details'; end if;
  if length(trim(p_delivery_address)) not between 5 and 300 or length(trim(p_delivery_city)) not between 2 and 100 or length(trim(p_delivery_state)) not between 2 and 100 then raise exception 'invalid_delivery_details'; end if;
  if length(coalesce(p_delivery_notes, '')) > 500 then raise exception 'invalid_delivery_details'; end if;

  select c.id into v_cart_id from public.carts c where c.user_id = v_user_id for update;
  if v_cart_id is null then raise exception 'empty_cart'; end if;
  if not exists (select 1 from public.cart_items ci where ci.cart_id = v_cart_id) then raise exception 'empty_cart'; end if;
  select s.standard_delivery_fee_kobo into v_fee from public.store_settings s where s.id = true;
  if v_fee is null then raise exception 'delivery_fee_not_configured'; end if;

  for v_item in
    select ci.id as cart_item_id, ci.product_id, ci.variant_id, ci.quantity,
           p.name as product_name, p.price_kobo, p.stock_quantity as product_stock,
           p.is_active, p.sku
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart_id
    order by p.id
    for update of ci, p
  loop
    if not v_item.is_active then raise exception 'product_unavailable'; end if;
    v_unit_price := v_item.price_kobo;
    v_stock := v_item.product_stock;
    if v_item.variant_id is not null then
      select pv.name, pv.value, pv.price_modifier_kobo, pv.stock_quantity
      into v_variant
      from public.product_variants pv
      where pv.id = v_item.variant_id and pv.product_id = v_item.product_id
      for update;
      if not found then raise exception 'variant_unavailable'; end if;
      v_unit_price := v_unit_price + v_variant.price_modifier_kobo;
      v_stock := v_variant.stock_quantity;
    end if;
    if v_item.quantity > v_stock then raise exception 'insufficient_stock'; end if;
    v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
  end loop;

  v_total := v_subtotal + v_fee;
  v_order_number := 'NES-' || to_char(now() at time zone 'UTC', 'YYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  insert into public.orders (
    user_id, order_number, customer_name, customer_email, customer_phone,
    delivery_address, delivery_city, delivery_state, delivery_notes,
    subtotal_kobo, delivery_fee_kobo, total_kobo, status
  ) values (
    v_user_id, v_order_number, trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    trim(p_delivery_address), trim(p_delivery_city), trim(p_delivery_state), nullif(trim(coalesce(p_delivery_notes,'')),''),
    v_subtotal, v_fee, v_total, 'pending'
  ) returning orders.id into v_order_id;

  for v_item in
    select ci.product_id, ci.variant_id, ci.quantity, p.name as product_name,
           p.price_kobo, p.stock_quantity as product_stock, p.sku
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart_id
    order by p.id
  loop
    v_unit_price := v_item.price_kobo;
    select pi.image_url into v_image_url from public.product_images pi where pi.product_id = v_item.product_id order by pi.display_order limit 1;
    if v_item.variant_id is not null then
      select pv.name || ': ' || pv.value as variant_name, pv.price_modifier_kobo
      into v_variant
      from public.product_variants pv
      where pv.id = v_item.variant_id and pv.product_id = v_item.product_id;
      v_unit_price := v_unit_price + v_variant.price_modifier_kobo;
      update public.product_variants as pv
      set stock_quantity = pv.stock_quantity - v_item.quantity, updated_at = now()
      where pv.id = v_item.variant_id;
      if not found then raise exception 'variant_unavailable'; end if;
      insert into public.order_items (order_id, product_id, product_name, product_price_kobo, product_image_url, variant_id, variant_name, quantity, subtotal_kobo)
      values (v_order_id, v_item.product_id, v_item.product_name, v_unit_price, v_image_url, v_item.variant_id, v_variant.variant_name, v_item.quantity, v_unit_price * v_item.quantity);
    else
      update public.products as p
      set stock_quantity = p.stock_quantity - v_item.quantity, updated_at = now()
      where p.id = v_item.product_id and p.stock_quantity >= v_item.quantity;
      if not found then raise exception 'insufficient_stock'; end if;
      insert into public.order_items (order_id, product_id, product_name, product_price_kobo, product_image_url, quantity, subtotal_kobo)
      values (v_order_id, v_item.product_id, v_item.product_name, v_unit_price, v_image_url, v_item.quantity, v_unit_price * v_item.quantity);
    end if;
  end loop;

  delete from public.cart_items ci where ci.cart_id = v_cart_id;
  return query select v_order_id, v_order_number, v_subtotal, v_fee, v_total;
end;
$$;

revoke all on function public.create_order_from_cart(text,text,text,text,text,text,text) from public;
grant execute on function public.create_order_from_cart(text,text,text,text,text,text,text) to authenticated;
