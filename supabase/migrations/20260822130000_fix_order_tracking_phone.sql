-- Keep the customer-facing order tracker working for both guest and signed-in
-- checkouts. Older signed-in orders stored the checkout phone only inside the
-- structured delivery address while get_order_tracking checked guest_phone.

update public.orders
set guest_phone = nullif(
  btrim(substring(coalesce(delivery_address, '') from 'Phone:[[:space:]]*([^|]+)')),
  ''
)
where nullif(btrim(coalesce(guest_phone, '')), '') is null
  and nullif(
    btrim(substring(coalesce(delivery_address, '') from 'Phone:[[:space:]]*([^|]+)')),
    ''
  ) is not null;

create or replace function public.populate_order_contact_phone()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if nullif(btrim(coalesce(new.guest_phone, '')), '') is null then
    new.guest_phone := nullif(
      btrim(substring(coalesce(new.delivery_address, '') from 'Phone:[[:space:]]*([^|]+)')),
      ''
    );
  end if;

  return new;
end;
$$;

revoke all on function public.populate_order_contact_phone() from public;

drop trigger if exists populate_order_contact_phone_before_write on public.orders;
create trigger populate_order_contact_phone_before_write
before insert or update of guest_phone, delivery_address on public.orders
for each row execute function public.populate_order_contact_phone();

create or replace function public.get_order_tracking(
  p_order_reference text,
  p_phone text
)
returns table (
  order_reference text,
  fulfillment_status text,
  placed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_reference text := upper(trim(coalesce(p_order_reference, '')));
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
begin
  if normalized_reference !~ '^SEN-[A-F0-9]{8}$' then
    return;
  end if;

  if normalized_phone like '971%' then
    normalized_phone := '0' || substring(normalized_phone from 4);
  end if;

  if length(normalized_phone) < 8 then
    return;
  end if;

  return query
  select
    'SEN-' || upper(left(candidate.id::text, 8)) as order_reference,
    candidate.fulfillment_status,
    candidate.created_at as placed_at
  from (
    select
      o.*,
      regexp_replace(
        coalesce(
          nullif(btrim(coalesce(o.guest_phone, '')), ''),
          nullif(
            btrim(substring(coalesce(o.delivery_address, '') from 'Phone:[[:space:]]*([^|]+)')),
            ''
          ),
          ''
        ),
        '[^0-9]',
        '',
        'g'
      ) as contact_phone_digits
    from public.orders o
    where upper(left(o.id::text, 8)) = replace(normalized_reference, 'SEN-', '')
  ) candidate
  where (
    case
      when candidate.contact_phone_digits like '971%'
        then '0' || substring(candidate.contact_phone_digits from 4)
      else candidate.contact_phone_digits
    end
  ) = normalized_phone
  limit 1;
end;
$$;

revoke all on function public.get_order_tracking(text, text) from public;
revoke all on function public.get_order_tracking(text, text) from anon;
revoke all on function public.get_order_tracking(text, text) from authenticated;
grant execute on function public.get_order_tracking(text, text) to service_role;
