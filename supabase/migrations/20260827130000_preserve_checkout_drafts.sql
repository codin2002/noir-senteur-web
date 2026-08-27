-- Keep pre-payment checkout records as private operational history until an admin chooses to remove them.

alter table public.checkout_drafts
  alter column expires_at drop default,
  alter column expires_at drop not null;

update public.checkout_drafts
set expires_at = null;

drop index if exists public.checkout_drafts_admin_queue_idx;
create index if not exists checkout_drafts_admin_queue_idx
  on public.checkout_drafts (mode, status, updated_at desc)
  where status = 'draft';

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
    nullif(btrim(substring(draft.delivery_address from 'Contact: ([^|]*)')), ''),
    nullif(btrim(substring(draft.delivery_address from 'Phone: ([^|]*)')), ''),
    nullif(btrim(substring(draft.delivery_address from 'Email: ([^|]*)')), ''),
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
