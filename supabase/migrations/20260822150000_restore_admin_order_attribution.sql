-- Restore the attribution columns that were accidentally omitted when the
-- grouped manual-order admin feed replaced get_orders_with_items_v2.
drop function if exists public.get_orders_with_items_v2(uuid);

create function public.get_orders_with_items_v2(user_uuid uuid default null)
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
  manual_lines jsonb,
  traffic_source text,
  meta_click_id text,
  utm_source text,
  utm_campaign text,
  utm_content text,
  items jsonb
)
language plpgsql
security definer
set search_path = ''
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
    o.manual_lines,
    o.traffic_source,
    o.meta_click_id,
    o.utm_source,
    o.utm_campaign,
    o.utm_content,
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
  group by
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
    o.manual_lines,
    o.traffic_source,
    o.meta_click_id,
    o.utm_source,
    o.utm_campaign,
    o.utm_content
  order by o.created_at desc;
end;
$$;

revoke all on function public.get_orders_with_items_v2(uuid) from public, anon;
grant execute on function public.get_orders_with_items_v2(uuid) to authenticated;
