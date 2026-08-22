-- Save delivery contact details on every order, including signed-in customers.
create or replace function public.sync_order_delivery_contact()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_name text;
  v_email text;
  v_phone text;
begin
  if new.delivery_address is not null then
    v_name := nullif(trim((regexp_match(new.delivery_address, E'(?:^|\\|\\s*)Contact:\\s*([^|]+)'))[1]), '');
    v_email := nullif(trim((regexp_match(new.delivery_address, E'(?:^|\\|\\s*)Email:\\s*([^|]+)'))[1]), '');
    v_phone := nullif(trim((regexp_match(new.delivery_address, E'(?:^|\\|\\s*)Phone:\\s*([^|]+)'))[1]), '');
  end if;

  new.guest_name := coalesce(nullif(trim(new.guest_name), ''), v_name);
  new.guest_email := coalesce(nullif(trim(new.guest_email), ''), v_email);
  new.guest_phone := coalesce(nullif(trim(new.guest_phone), ''), v_phone);
  return new;
end;
$$;

drop trigger if exists sync_order_delivery_contact on public.orders;
create trigger sync_order_delivery_contact
before insert or update of delivery_address on public.orders
for each row execute function public.sync_order_delivery_contact();

-- Restore delivery names for existing orders where the structured address has them.
with contacts as (
  select
    id,
    nullif(trim((regexp_match(delivery_address, E'(?:^|\\|\\s*)Contact:\\s*([^|]+)'))[1]), '') as contact_name,
    nullif(trim((regexp_match(delivery_address, E'(?:^|\\|\\s*)Email:\\s*([^|]+)'))[1]), '') as contact_email,
    nullif(trim((regexp_match(delivery_address, E'(?:^|\\|\\s*)Phone:\\s*([^|]+)'))[1]), '') as contact_phone
  from public.orders
  where delivery_address is not null
)
update public.orders o
set
  guest_name = coalesce(nullif(trim(o.guest_name), ''), contacts.contact_name),
  guest_email = coalesce(nullif(trim(o.guest_email), ''), contacts.contact_email),
  guest_phone = coalesce(nullif(trim(o.guest_phone), ''), contacts.contact_phone)
from contacts
where o.id = contacts.id
  and (o.guest_name is null or o.guest_email is null or o.guest_phone is null);

revoke all on function public.sync_order_delivery_contact() from public;
