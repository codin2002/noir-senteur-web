-- Support grouped manual entries, including the Signature Duo and extra bottles.
alter table public.orders
  add column if not exists manual_lines jsonb not null default '[]'::jsonb;

create function public.get_orders_with_items_v2(user_uuid uuid default null)
returns table(
  id uuid, user_id uuid, total numeric, status text, fulfillment_status text,
  order_source text, created_at timestamptz, guest_name text, guest_email text,
  guest_phone text, delivery_address text, notes text, manual_lines jsonb, items jsonb
)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;
  return query
  select o.id, o.user_id, o.total, o.status, o.fulfillment_status, o.order_source,
    o.created_at, o.guest_name, o.guest_email, o.guest_phone, o.delivery_address,
    o.notes, o.manual_lines,
    coalesce(json_agg(json_build_object(
      'id', oi.id, 'perfume_id', oi.perfume_id, 'quantity', oi.quantity,
      'price', oi.price, 'perfume', row_to_json(p)
    )) filter (where oi.id is not null), '[]'::json)::jsonb as items
  from public.orders o
  left join public.order_items oi on o.id = oi.order_id
  left join public.perfumes p on oi.perfume_id = p.id
  where user_uuid is null or o.user_id = user_uuid
  group by o.id, o.user_id, o.total, o.status, o.fulfillment_status, o.order_source,
    o.created_at, o.guest_name, o.guest_email, o.guest_phone, o.delivery_address,
    o.notes, o.manual_lines
  order by o.created_at desc;
end;
$$;

revoke all on function public.get_orders_with_items_v2(uuid) from public;
grant execute on function public.get_orders_with_items_v2(uuid) to authenticated;

create function public.create_manual_order(
  p_lines jsonb,
  p_customer_name text,
  p_customer_phone text default null,
  p_customer_email text default null,
  p_delivery_address text default null,
  p_notes text default null,
  p_already_handed_over boolean default false
)
returns table(order_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid; v_line jsonb; v_kind text; v_perfume_id uuid;
  v_313_id uuid; v_424_id uuid; v_quantity integer; v_unit_price numeric;
  v_total numeric := 0; v_stock integer; v_name text; v_manual_lines jsonb := '[]'::jsonb;
begin
  if auth.uid() is null or not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;
  if nullif(trim(p_customer_name), '') is null then raise exception 'Customer name is required'; end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then raise exception 'Add at least one order item'; end if;
  select id into v_313_id from public.perfumes where name = '٣١٣' limit 1;
  select id into v_424_id from public.perfumes where name = '٤٢٤' limit 1;
  if v_313_id is null or v_424_id is null then raise exception 'The Signature Duo products could not be found'; end if;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_kind := v_line->>'kind';
    v_quantity := nullif(v_line->>'quantity', '')::integer;
    v_unit_price := nullif(v_line->>'unit_price', '')::numeric;
    if v_kind not in ('perfume', 'signature_duo') or v_quantity is null or v_quantity < 1 or v_unit_price is null or v_unit_price < 0 then
      raise exception 'Each order item needs a valid product, quantity and price';
    end if;
    if v_kind = 'perfume' and nullif(v_line->>'perfume_id', '') is null then raise exception 'Choose a perfume for each perfume line'; end if;
    v_total := v_total + (v_quantity * v_unit_price);
  end loop;

  insert into public.orders (
    total, status, fulfillment_status, payment_status, order_source,
    guest_name, guest_email, guest_phone, delivery_address, notes
  ) values (
    v_total, case when p_already_handed_over then 'delivered' else 'processing' end,
    case when p_already_handed_over then 'delivered' else 'new' end,
    'manual', 'manual', trim(p_customer_name), nullif(trim(coalesce(p_customer_email, '')), ''),
    nullif(trim(coalesce(p_customer_phone, '')), ''), nullif(trim(coalesce(p_delivery_address, '')), ''),
    nullif(trim(coalesce(p_notes, '')), '')
  ) returning id into v_order_id;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_kind := v_line->>'kind'; v_quantity := (v_line->>'quantity')::integer; v_unit_price := (v_line->>'unit_price')::numeric;
    if v_kind = 'signature_duo' then
      v_manual_lines := v_manual_lines || jsonb_build_array(jsonb_build_object('label', 'Signature Duo (٣١٣ + ٤٢٤)', 'quantity', v_quantity, 'unit_price', v_unit_price));
      foreach v_perfume_id in array array[v_313_id, v_424_id] loop
        select stock_quantity into v_stock from public.inventory where perfume_id = v_perfume_id for update;
        if not found or v_stock < v_quantity then
          select name into v_name from public.perfumes where id = v_perfume_id;
          raise exception 'Not enough stock for %', coalesce(v_name, 'a Signature Duo product');
        end if;
        insert into public.order_items(order_id, perfume_id, quantity, price, is_preorder) values (v_order_id, v_perfume_id, v_quantity, v_unit_price / 2, false);
        update public.inventory set stock_quantity = v_stock - v_quantity, updated_at = now() where perfume_id = v_perfume_id;
        insert into public.inventory_logs(perfume_id, change_type, quantity_before, quantity_after, quantity_change, reason, order_id, action_category, reference_id, user_name)
        values (v_perfume_id, 'order_delivery', v_stock, v_stock - v_quantity, -v_quantity, 'Manual entry: Signature Duo', v_order_id, 'sale', v_order_id::text, trim(p_customer_name));
      end loop;
    else
      v_perfume_id := (v_line->>'perfume_id')::uuid;
      select p.name, i.stock_quantity into v_name, v_stock from public.inventory i join public.perfumes p on p.id = i.perfume_id where i.perfume_id = v_perfume_id for update;
      if not found then raise exception 'Inventory record was not found for this perfume'; end if;
      if v_stock < v_quantity then raise exception 'Only % item(s) of % are available in stock', v_stock, v_name; end if;
      v_manual_lines := v_manual_lines || jsonb_build_array(jsonb_build_object('label', v_name, 'quantity', v_quantity, 'unit_price', v_unit_price));
      insert into public.order_items(order_id, perfume_id, quantity, price, is_preorder) values (v_order_id, v_perfume_id, v_quantity, v_unit_price, false);
      update public.inventory set stock_quantity = v_stock - v_quantity, updated_at = now() where perfume_id = v_perfume_id;
      insert into public.inventory_logs(perfume_id, change_type, quantity_before, quantity_after, quantity_change, reason, order_id, action_category, reference_id, user_name)
      values (v_perfume_id, 'order_delivery', v_stock, v_stock - v_quantity, -v_quantity, 'Manual entry: offline sale or gift', v_order_id, 'sale', v_order_id::text, trim(p_customer_name));
    end if;
  end loop;
  update public.orders set manual_lines = v_manual_lines where id = v_order_id;
  return query select v_order_id;
end;
$$;

revoke all on function public.create_manual_order(jsonb, text, text, text, text, text, boolean) from public;
grant execute on function public.create_manual_order(jsonb, text, text, text, text, text, boolean) to authenticated;
