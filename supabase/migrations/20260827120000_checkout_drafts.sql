-- Checkout drafts save delivery details before the customer opens Ziina.
-- They are private operational records, not orders: no stock is touched here.

create table if not exists public.checkout_drafts (
  id uuid primary key default gen_random_uuid(),
  draft_token uuid not null default gen_random_uuid() unique,
  user_id uuid references auth.users(id),
  is_guest boolean not null default true,
  cart_items jsonb not null,
  delivery_address text not null,
  amount numeric not null check (amount > 0),
  currency text not null default 'AED',
  offer_id text,
  mode text not null check (mode in ('test', 'live')),
  status text not null default 'draft' check (status in ('draft', 'payment_started', 'dismissed')),
  pending_checkout_id uuid references public.pending_ziina_checkouts(id),
  meta_context jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '72 hours'
);

alter table public.checkout_drafts enable row level security;
revoke all on table public.checkout_drafts from public, anon, authenticated;
create index if not exists checkout_drafts_admin_queue_idx
  on public.checkout_drafts (mode, status, updated_at desc)
  where status = 'draft';

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
    and draft.expires_at > now()
  order by draft.updated_at desc
  limit 30;
end;
$$;

revoke all on function public.get_admin_checkout_drafts() from public, anon;
grant execute on function public.get_admin_checkout_drafts() to authenticated;
