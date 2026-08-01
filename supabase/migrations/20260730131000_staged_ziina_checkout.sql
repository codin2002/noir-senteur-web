-- Generated migration filename fallback: Supabase CLI 2.110.0 cannot create
-- a file in this existing migrations directory (LegacyMigrationNewWriteError).
-- This schema is inert until create-payment-v2 is used.
create table if not exists public.pending_ziina_checkouts (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id text unique,
  operation_id uuid not null default gen_random_uuid() unique,
  lookup_token uuid not null default gen_random_uuid(),
  user_id uuid references auth.users(id),
  is_guest boolean not null,
  cart_items jsonb not null,
  delivery_address text not null,
  amount numeric not null check (amount > 0),
  currency text not null default 'AED',
  mode text not null check (mode in ('test', 'live')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  order_id uuid references public.orders(id),
  provider_payload jsonb,
  meta_context jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
alter table public.pending_ziina_checkouts enable row level security;
alter table public.pending_ziina_checkouts alter column payment_intent_id drop not null;
alter table public.pending_ziina_checkouts add column if not exists operation_id uuid default gen_random_uuid();
alter table public.pending_ziina_checkouts add column if not exists meta_context jsonb;
alter table public.pending_ziina_checkouts add column if not exists lookup_token uuid default gen_random_uuid();
update public.pending_ziina_checkouts set lookup_token = gen_random_uuid() where lookup_token is null;
alter table public.pending_ziina_checkouts alter column lookup_token set not null;
update public.pending_ziina_checkouts set operation_id = gen_random_uuid() where operation_id is null;
alter table public.pending_ziina_checkouts alter column operation_id set not null;
create unique index if not exists pending_ziina_checkouts_operation_id_key
  on public.pending_ziina_checkouts(operation_id);

alter table public.orders add column if not exists payment_intent_id text;
alter table public.orders add column if not exists processing_email_claimed_at timestamptz;
alter table public.orders add column if not exists delivery_email_claimed_at timestamptz;
alter table public.orders add column if not exists meta_purchase_sent boolean not null default false;
alter table public.orders add column if not exists meta_purchase_claimed_at timestamptz;
alter table public.successful_payments alter column customer_email drop not null;
create unique index if not exists orders_payment_intent_id_key
  on public.orders(payment_intent_id) where payment_intent_id is not null;
create unique index if not exists successful_payments_payment_id_key
  on public.successful_payments(payment_id);

create or replace function public.create_order_from_ziina_checkout(
  p_payment_intent_id text, p_cart_items jsonb, p_amount numeric,
  p_user_id uuid, p_is_guest boolean, p_customer_name text,
  p_customer_email text, p_customer_phone text, p_delivery_address text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid;
  v_checkout_status text;
  v_checkout_amount numeric;
  v_item record;
  v_product_type text;
  v_preorder_enabled boolean;
  v_stock integer;
  v_inventory_found boolean;
  v_is_preorder boolean;
  v_item_count integer := 0;
  v_preorder_count integer := 0;
begin
  -- Serialise retries for the same payment. A second webhook waits for the
  -- first transaction, then returns its order without touching stock again.
  select order_id, status, amount into v_order_id, v_checkout_status, v_checkout_amount
  from pending_ziina_checkouts
  where payment_intent_id = p_payment_intent_id
  for update;

  if not found then
    raise exception 'Unknown pending checkout';
  end if;
  if round(v_checkout_amount * 100) <> round(p_amount * 100) then
    raise exception 'Payment amount does not match pending checkout';
  end if;
  if v_checkout_status = 'completed' and v_order_id is not null then
    return v_order_id;
  end if;

  update pending_ziina_checkouts set status = 'processing'
  where payment_intent_id = p_payment_intent_id;

  insert into orders (user_id, total, guest_name, guest_email, guest_phone, delivery_address, payment_status, payment_intent_id)
  values (case when p_is_guest then null else p_user_id end, p_amount,
          case when p_is_guest then p_customer_name end,
          case when p_is_guest then nullif(p_customer_email, '') end,
          case when p_is_guest then p_customer_phone end,
          p_delivery_address, 'completed', p_payment_intent_id)
  returning id into v_order_id;

  for v_item in select * from jsonb_to_recordset(p_cart_items) as x(perfume_id uuid, quantity integer, price numeric)
  loop
    if v_item.quantity is null or v_item.quantity < 1 or v_item.price is null or v_item.price <= 0 then
      raise exception 'Invalid checkout item';
    end if;

    select product_type, preorder_enabled
      into v_product_type, v_preorder_enabled
    from perfumes where id = v_item.perfume_id;
    if not found then raise exception 'Unknown perfume %', v_item.perfume_id; end if;

    select stock_quantity into v_stock
    from inventory where perfume_id = v_item.perfume_id
    for update;
    v_inventory_found := found;
    v_is_preorder := v_product_type = 'preorder'
      or coalesce(v_preorder_enabled, false)
      or not v_inventory_found
      or v_stock < v_item.quantity;

    insert into order_items(order_id, perfume_id, quantity, price, is_preorder)
    values(v_order_id, v_item.perfume_id, v_item.quantity, v_item.price, v_is_preorder);
    v_item_count := v_item_count + 1;

    if v_is_preorder then
      v_preorder_count := v_preorder_count + 1;
      update perfumes set preorder_count = preorder_count + v_item.quantity
      where id = v_item.perfume_id;
      if v_inventory_found then
        update inventory set reserved_stock = reserved_stock + v_item.quantity, updated_at = now()
        where perfume_id = v_item.perfume_id;
      end if;
      insert into preorders(perfume_id, user_id, guest_name, guest_email, guest_phone, quantity, status, order_id)
      values(v_item.perfume_id, case when p_is_guest then null else p_user_id end,
        case when p_is_guest then p_customer_name end, case when p_is_guest then nullif(p_customer_email, '') end,
        case when p_is_guest then p_customer_phone end, v_item.quantity, 'pending', v_order_id);
    else
      update inventory set stock_quantity = v_stock - v_item.quantity, updated_at = now()
      where perfume_id = v_item.perfume_id;
      insert into inventory_logs(perfume_id, change_type, quantity_before, quantity_after,
        quantity_change, reason, order_id, action_category, reference_id)
      values(v_item.perfume_id, 'order_delivery', v_stock, v_stock - v_item.quantity,
        -v_item.quantity, 'Inventory reduced for webhook-confirmed order', v_order_id,
        'sale', p_payment_intent_id);
    end if;
  end loop;

  if v_item_count = 0 then raise exception 'Checkout has no items'; end if;
  update orders set
    is_preorder = v_preorder_count > 0,
    status = case when v_preorder_count = v_item_count then 'awaiting_release' else 'processing' end
  where id = v_order_id;

  insert into successful_payments(payment_id, order_id, amount, currency, payment_method, payment_status,
    user_id, customer_name, customer_email, delivery_address, product_details)
  values (p_payment_intent_id, v_order_id, p_amount, 'AED', 'ziina', 'completed',
    case when p_is_guest then null else p_user_id end, p_customer_name, nullif(p_customer_email, ''), p_delivery_address, 'Recorded by signed Ziina webhook');
  update pending_ziina_checkouts set status='completed', order_id=v_order_id, processed_at=now()
    where payment_intent_id=p_payment_intent_id;
  return v_order_id;
end; $$;

revoke all on function public.create_order_from_ziina_checkout(text,jsonb,numeric,uuid,boolean,text,text,text,text) from public;
revoke execute on function public.create_order_from_ziina_checkout(text,jsonb,numeric,uuid,boolean,text,text,text,text) from anon, authenticated;
grant execute on function public.create_order_from_ziina_checkout(text,jsonb,numeric,uuid,boolean,text,text,text,text) to service_role;

create or replace function public.claim_order_email(p_order_id uuid, p_email_type text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_claimed uuid;
begin
  if p_email_type = 'processing' then
    update orders set processing_email_claimed_at = now()
    where id = p_order_id
      and coalesce(processing_email_sent, false) = false
      and (processing_email_claimed_at is null or processing_email_claimed_at < now() - interval '10 minutes')
    returning id into v_claimed;
  elsif p_email_type = 'delivered' then
    update orders set delivery_email_claimed_at = now()
    where id = p_order_id
      and coalesce(delivery_email_sent, false) = false
      and (delivery_email_claimed_at is null or delivery_email_claimed_at < now() - interval '10 minutes')
    returning id into v_claimed;
  else
    raise exception 'Unsupported email type';
  end if;
  return v_claimed is not null;
end; $$;

revoke all on function public.claim_order_email(uuid,text) from public;
revoke execute on function public.claim_order_email(uuid,text) from anon, authenticated;
grant execute on function public.claim_order_email(uuid,text) to service_role;

create or replace function public.claim_meta_purchase(p_order_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_claimed uuid;
begin
  update orders set meta_purchase_claimed_at = now()
  where id = p_order_id
    and coalesce(meta_purchase_sent, false) = false
    and (meta_purchase_claimed_at is null or meta_purchase_claimed_at < now() - interval '10 minutes')
  returning id into v_claimed;
  return v_claimed is not null;
end; $$;

revoke all on function public.claim_meta_purchase(uuid) from public;
revoke execute on function public.claim_meta_purchase(uuid) from anon, authenticated;
grant execute on function public.claim_meta_purchase(uuid) to service_role;
