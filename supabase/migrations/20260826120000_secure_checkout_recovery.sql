-- Supabase CLI 2.110.0 cannot write its telemetry file on this Windows host,
-- so this migration file is created directly after the required CLI attempt.
-- Pending checkout details remain private and are exposed only through an
-- administrator-checked RPC with a deliberately limited return shape.

alter table public.pending_ziina_checkouts
  add column if not exists recovery_status text not null default 'new'
  check (recovery_status in ('new', 'contacted', 'dismissed'));

create index if not exists pending_checkout_recovery_queue_idx
  on public.pending_ziina_checkouts (mode, status, created_at desc)
  where order_id is null;

drop function if exists public.get_admin_checkout_recovery();
create function public.get_admin_checkout_recovery()
returns table(
  id uuid,
  created_at timestamptz,
  amount numeric,
  currency text,
  checkout_status text,
  provider_status text,
  recovery_status text,
  customer_name text,
  customer_phone text,
  customer_email text,
  delivery_address text,
  offer_name text,
  reminder_consent boolean,
  cart_items jsonb
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
    checkout.id,
    checkout.created_at,
    checkout.amount,
    checkout.currency,
    checkout.status,
    nullif(checkout.provider_payload ->> 'status', ''),
    checkout.recovery_status,
    nullif(btrim(substring(checkout.delivery_address from 'Contact: ([^|]*)')), ''),
    nullif(btrim(substring(checkout.delivery_address from 'Phone: ([^|]*)')), ''),
    nullif(btrim(substring(checkout.delivery_address from 'Email: ([^|]*)')), ''),
    nullif(btrim(substring(checkout.delivery_address from 'Address: ([^|]*)')), ''),
    nullif(checkout.meta_context ->> 'offer_name', ''),
    coalesce((checkout.meta_context ->> 'reminder_consent')::boolean, false),
    checkout.cart_items
  from public.pending_ziina_checkouts checkout
  where checkout.mode = 'live'
    and checkout.order_id is null
    and checkout.status in ('pending', 'failed')
    and checkout.created_at >= now() - interval '30 days'
    and checkout.created_at <= now() - interval '15 minutes'
  order by checkout.created_at desc;
end;
$$;

revoke all on function public.get_admin_checkout_recovery() from public, anon;
grant execute on function public.get_admin_checkout_recovery() to authenticated;

drop function if exists public.update_checkout_recovery_status(uuid, text);
create function public.update_checkout_recovery_status(p_checkout_id uuid, p_status text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_id uuid;
begin
  if auth.uid() is null or not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;
  if p_status not in ('new', 'contacted', 'dismissed') then
    raise exception 'Unsupported recovery status' using errcode = '22023';
  end if;

  update public.pending_ziina_checkouts
  set recovery_status = p_status
  where id = p_checkout_id
    and order_id is null
  returning id into updated_id;

  return updated_id is not null;
end;
$$;

revoke all on function public.update_checkout_recovery_status(uuid, text) from public, anon;
grant execute on function public.update_checkout_recovery_status(uuid, text) to authenticated;
