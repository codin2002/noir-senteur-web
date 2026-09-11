-- Expose the server-recorded checkout offer in the admin order feed so the
-- portal can distinguish a Signature Collection from separately added items.
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
  offer_id text,
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
    checkout.offer_id,
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
  left join lateral (
    select pending.meta_context ->> 'offer_id' as offer_id
    from public.pending_ziina_checkouts pending
    where pending.order_id = o.id
      and pending.status = 'completed'
    order by pending.processed_at desc nulls last, pending.created_at desc
    limit 1
  ) checkout on true
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
    o.utm_content,
    checkout.offer_id
  order by o.created_at desc;
end;
$$;

revoke all on function public.get_orders_with_items_v2(uuid) from public, anon;
grant execute on function public.get_orders_with_items_v2(uuid) to authenticated;
