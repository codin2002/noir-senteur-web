-- Supabase CLI 2.110.0 cannot create a migration in this legacy directory
-- (LegacyMigrationNewWriteError), so this file is the documented fallback.
alter table public.orders
  add column if not exists traffic_source text not null default 'unknown'
    check (traffic_source in ('meta_ads', 'direct', 'unknown')),
  add column if not exists meta_click_id text,
  add column if not exists meta_fbc text,
  add column if not exists meta_fbp text,
  add column if not exists utm_source text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists landing_url text;

drop function if exists public.get_orders_with_items(uuid);

create function public.get_orders_with_items(user_uuid uuid default null)
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
  traffic_source text,
  meta_click_id text,
  utm_source text,
  utm_campaign text,
  utm_content text,
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
  group by o.id
  order by o.created_at desc;
end;
$$;

revoke all on function public.get_orders_with_items(uuid) from public;
revoke execute on function public.get_orders_with_items(uuid) from anon;
grant execute on function public.get_orders_with_items(uuid) to authenticated;
