-- Make saved checkout customer details easy to view in the dashboard and Table Editor.

alter table public.checkout_drafts
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text;

update public.checkout_drafts
set
  customer_name = coalesce(customer_name, nullif(trim((regexp_match(delivery_address, E'(?:^|\\|\\s*)Contact:\\s*([^|]+)'))[1]), '')),
  customer_phone = coalesce(customer_phone, nullif(trim((regexp_match(delivery_address, E'(?:^|\\|\\s*)Phone:\\s*([^|]+)'))[1]), '')),
  customer_email = coalesce(customer_email, nullif(trim((regexp_match(delivery_address, E'(?:^|\\|\\s*)Email:\\s*([^|]+)'))[1]), ''));

create or replace function public.get_admin_checkout_drafts()
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
    draft.cart_items
  from public.checkout_drafts draft
  where draft.status = 'draft'
  order by draft.updated_at desc
  limit 100;
end;
$$;

revoke all on function public.get_admin_checkout_drafts() from public, anon;
grant execute on function public.get_admin_checkout_drafts() to authenticated;
