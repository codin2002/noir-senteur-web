-- Customer-facing tracking reveals no contact, address, order items, or payment data.
-- The lookup is usable only by the server-side Edge Function after both the order
-- reference and checkout mobile number have been supplied.
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
    'SEN-' || upper(left(o.id::text, 8)) as order_reference,
    o.fulfillment_status,
    o.created_at as placed_at
  from public.orders o
  where upper(left(o.id::text, 8)) = replace(normalized_reference, 'SEN-', '')
    and (
      case
        when regexp_replace(coalesce(o.guest_phone, ''), '[^0-9]', '', 'g') like '971%'
          then '0' || substring(regexp_replace(coalesce(o.guest_phone, ''), '[^0-9]', '', 'g') from 4)
        else regexp_replace(coalesce(o.guest_phone, ''), '[^0-9]', '', 'g')
      end
    ) = normalized_phone
  limit 1;
end;
$$;

revoke all on function public.get_order_tracking(text, text) from public;
revoke all on function public.get_order_tracking(text, text) from anon;
revoke all on function public.get_order_tracking(text, text) from authenticated;
grant execute on function public.get_order_tracking(text, text) to service_role;
