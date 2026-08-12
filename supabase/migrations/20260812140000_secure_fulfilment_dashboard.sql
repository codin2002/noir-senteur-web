-- A small, explicit delivery workflow for administrators.
alter table public.orders
  add column if not exists fulfillment_status text not null default 'new'
  check (fulfillment_status in ('new', 'packed', 'shipped', 'delivered'));

-- Keep existing historical orders in a sensible stage when the workflow is added.
update public.orders
set fulfillment_status = case
  when status = 'delivered' then 'delivered'
  when status = 'dispatched' then 'shipped'
  else 'new'
end
where fulfillment_status = 'new';

drop function if exists public.get_orders_with_items(uuid);

create or replace function public.get_orders_with_items(user_uuid uuid default null)
returns table(
  id uuid,
  user_id uuid,
  total numeric,
  status text,
  fulfillment_status text,
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
  group by o.id, o.user_id, o.total, o.status, o.fulfillment_status, o.created_at,
    o.guest_name, o.guest_email, o.guest_phone, o.delivery_address, o.notes
  order by o.created_at desc;
end;
$$;

revoke all on function public.get_orders_with_items(uuid) from public;
grant execute on function public.get_orders_with_items(uuid) to authenticated;
