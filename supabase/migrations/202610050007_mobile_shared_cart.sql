-- Centralize cart validation so the website and native clients use the same rules.
create or replace function public.add_to_cart(p_product_id uuid, p_variant_id uuid default null, p_quantity integer default 1)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_item_id uuid;
  v_stock integer;
  v_existing public.cart_items%rowtype;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_quantity is null or p_quantity < 1 then raise exception 'invalid_quantity'; end if;
  insert into public.carts (user_id) values (v_user_id) on conflict (user_id) do update set updated_at = now() returning id into v_cart_id;
  select p.stock_quantity into v_stock from public.products p where p.id = p_product_id and p.is_active for update;
  if not found then raise exception 'product_unavailable'; end if;
  if p_variant_id is not null then
    select pv.stock_quantity into v_stock from public.product_variants pv where pv.id = p_variant_id and pv.product_id = p_product_id for update;
    if not found then raise exception 'variant_unavailable'; end if;
  end if;
  if p_quantity > v_stock then raise exception 'insufficient_stock'; end if;
  select ci.* into v_existing from public.cart_items ci where ci.cart_id = v_cart_id and ci.product_id = p_product_id and ci.variant_id is not distinct from p_variant_id for update;
  if found then
    if v_existing.quantity + p_quantity > v_stock then raise exception 'insufficient_stock'; end if;
    update public.cart_items set quantity = v_existing.quantity + p_quantity, updated_at = now() where id = v_existing.id;
    return v_existing.id;
  end if;
  insert into public.cart_items (cart_id, product_id, variant_id, quantity) values (v_cart_id, p_product_id, p_variant_id, p_quantity) returning id into v_item_id;
  return v_item_id;
end;
$$;

create or replace function public.set_cart_quantity(p_cart_item_id uuid, p_quantity integer)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.cart_items%rowtype;
  v_cart_id uuid;
  v_stock integer;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_quantity is null or p_quantity < 1 then raise exception 'invalid_quantity'; end if;
  select c.id into v_cart_id from public.carts c join public.cart_items ci on ci.cart_id = c.id where ci.id = p_cart_item_id and c.user_id = v_user_id;
  if not found then raise exception 'cart_item_not_found'; end if;
  perform 1 from public.carts c where c.id = v_cart_id for update;
  select ci.* into v_item from public.cart_items ci where ci.id = p_cart_item_id and ci.cart_id = v_cart_id;
  select p.stock_quantity into v_stock from public.products p where p.id = v_item.product_id and p.is_active for update;
  if not found then raise exception 'product_unavailable'; end if;
  if v_item.variant_id is not null then
    select pv.stock_quantity into v_stock from public.product_variants pv where pv.id = v_item.variant_id and pv.product_id = v_item.product_id for update;
    if not found then raise exception 'variant_unavailable'; end if;
  end if;
  if p_quantity > v_stock then raise exception 'insufficient_stock'; end if;
  update public.cart_items set quantity = p_quantity, updated_at = now() where id = v_item.id and cart_id = v_cart_id;
end;
$$;

create or replace function public.remove_cart_item(p_cart_item_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  select c.id into v_cart_id from public.carts c join public.cart_items ci on ci.cart_id = c.id where ci.id = p_cart_item_id and c.user_id = v_user_id;
  if not found then raise exception 'cart_item_not_found'; end if;
  perform 1 from public.carts c where c.id = v_cart_id for update;
  delete from public.cart_items ci where ci.id = p_cart_item_id and ci.cart_id = v_cart_id;
  if not found then raise exception 'cart_item_not_found'; end if;
end;
$$;

revoke all on function public.add_to_cart(uuid,uuid,integer) from public;
revoke all on function public.set_cart_quantity(uuid,integer) from public;
revoke all on function public.remove_cart_item(uuid) from public;
grant execute on function public.add_to_cart(uuid,uuid,integer) to authenticated;
grant execute on function public.set_cart_quantity(uuid,integer) to authenticated;
grant execute on function public.remove_cart_item(uuid) to authenticated;

-- Realtime is a refresh signal; clients query their own RLS-protected cart again.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cart_items') then
    alter publication supabase_realtime add table public.cart_items;
  end if;
end;
$$;
