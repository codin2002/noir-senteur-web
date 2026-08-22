-- Record gifts, offline sales, and other manually entered fulfilment items
-- alongside online Ziina orders, without invoking the payment flow.
alter table public.orders
  add column if not exists order_source text not null default 'online'
  check (order_source in ('online', 'manual'));

-- The return shape changes to include the source badge used by the admin portal.
drop function if exists public.get_orders_with_items(uuid);

create function public.get_orders_with_items(user_uuid uuid default null)
returns table(
  id uuid,
  user_id uuid,
  total numeric,
  status text,
  fulfillment_status text,
  order_source text,
  created_at timestamptz,
  guest_name text,
  guest_email text,
  guest_phone text,
  delivery_address text,
  notes text,
  items jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  return query
  select
    o.id,
    o.user_id,
    o.total,
    o.status,
    o.fulfillment_status,
    o.order_source,
    o.created_at,
    o.guest_name,
    o.guest_email,
    o.guest_phone,
    o.delivery_address,
    o.notes,
    coalesce(
      json_agg(
        json_build_object(
          'id', oi.id,
          'perfume_id', oi.perfume_id,
          'quantity', oi.quantity,
          'price', oi.price,
          'perfume', row_to_json(p)
        )
      ) filter (where oi.id is not null),
      '[]'::json
    )::jsonb as items
  from public.orders o
  left join public.order_items oi on o.id = oi.order_id
  left join public.perfumes p on oi.perfume_id = p.id
  where user_uuid is null or o.user_id = user_uuid
  group by o.id, o.user_id, o.total, o.status, o.fulfillment_status, o.order_source, o.created_at,
    o.guest_name, o.guest_email, o.guest_phone, o.delivery_address, o.notes
  order by o.created_at desc;
end;
$$;

revoke all on function public.get_orders_with_items(uuid) from public;
grant execute on function public.get_orders_with_items(uuid) to authenticated;

create function public.create_manual_order(
  p_perfume_id uuid,
  p_quantity integer,
  p_unit_price numeric,
  p_customer_name text,
  p_customer_phone text default null,
  p_customer_email text default null,
  p_delivery_address text default null,
  p_notes text default null,
  p_already_handed_over boolean default false
)
returns table(order_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_stock integer;
begin
  if auth.uid() is null or not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  if nullif(trim(p_customer_name), '') is null then
    raise exception 'Customer name is required';
  end if;

  if p_quantity is null or p_quantity < 1 then
    raise exception 'Quantity must be at least 1';
  end if;

  if p_unit_price is null or p_unit_price < 0 then
    raise exception 'Price cannot be negative';
  end if;

  select stock_quantity into v_stock
  from public.inventory
  where perfume_id = p_perfume_id
  for update;

  if not found then
    raise exception 'Inventory record was not found for this perfume';
  end if;

  if v_stock < p_quantity then
    raise exception 'Only % item(s) are available in stock', v_stock;
  end if;

  insert into public.orders (
    total, status, fulfillment_status, payment_status, order_source,
    guest_name, guest_email, guest_phone, delivery_address, notes
  ) values (
    p_quantity * p_unit_price,
    case when p_already_handed_over then 'delivered' else 'processing' end,
    case when p_already_handed_over then 'delivered' else 'new' end,
    'manual',
    'manual',
    trim(p_customer_name),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    nullif(trim(coalesce(p_customer_phone, '')), ''),
    nullif(trim(coalesce(p_delivery_address, '')), ''),
    nullif(trim(coalesce(p_notes, '')), '')
  ) returning id into v_order_id;

  insert into public.order_items(order_id, perfume_id, quantity, price, is_preorder)
  values (v_order_id, p_perfume_id, p_quantity, p_unit_price, false);

  update public.inventory
  set stock_quantity = v_stock - p_quantity,
      updated_at = now()
  where perfume_id = p_perfume_id;

  insert into public.inventory_logs(
    perfume_id, change_type, quantity_before, quantity_after, quantity_change,
    reason, order_id, action_category, reference_id, user_name
  ) values (
    p_perfume_id, 'order_delivery', v_stock, v_stock - p_quantity, -p_quantity,
    case when p_already_handed_over then 'Manual entry: handed over' else 'Manual entry: awaiting fulfilment' end,
    v_order_id, 'sale', v_order_id::text, trim(p_customer_name)
  );

  return query select v_order_id;
end;
$$;

revoke all on function public.create_manual_order(uuid, integer, numeric, text, text, text, text, text, boolean) from public;
grant execute on function public.create_manual_order(uuid, integer, numeric, text, text, text, text, text, boolean) to authenticated;
