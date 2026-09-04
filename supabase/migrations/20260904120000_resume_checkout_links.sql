-- Customer resume links use the existing random checkout tokens. They are only
-- returned to authenticated administrators and are resolved by the Edge
-- Function; no delivery information is ever included in the customer URL.

drop function if exists public.get_admin_checkout_drafts();
create function public.get_admin_checkout_drafts()
returns table(
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz,
  amount numeric,
  currency text,
  customer_name text,
  customer_phone text,
  customer_email text,
  delivery_address text,
  offer_name text,
  cart_items jsonb,
  resume_token uuid
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
    draft.id,
    draft.created_at,
    draft.updated_at,
    draft.expires_at,
    draft.amount,
    draft.currency,
    coalesce(draft.customer_name, nullif(btrim(substring(draft.delivery_address from 'Contact: ([^|]*)')), '')),
    coalesce(draft.customer_phone, nullif(btrim(substring(draft.delivery_address from 'Phone: ([^|]*)')), '')),
    coalesce(draft.customer_email, nullif(btrim(substring(draft.delivery_address from 'Email: ([^|]*)')), '')),
    nullif(btrim(substring(draft.delivery_address from 'Address: ([^|]*)')), ''),
    nullif(draft.meta_context ->> 'offer_name', ''),
    draft.cart_items,
    draft.draft_token
  from public.checkout_drafts draft
  where draft.status = 'draft'
    and draft.mode = 'live'
  order by draft.updated_at desc
  limit 100;
end;
$$;

revoke all on function public.get_admin_checkout_drafts() from public, anon;
grant execute on function public.get_admin_checkout_drafts() to authenticated;

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
  cart_items jsonb,
  resume_token uuid
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
    checkout.cart_items,
    checkout.lookup_token
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
