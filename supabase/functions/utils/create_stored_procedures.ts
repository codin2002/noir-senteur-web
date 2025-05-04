
// This file contains code for creating stored procedures in Supabase
// These functions will be used to perform complex database operations

/*
CREATE OR REPLACE FUNCTION get_cart_with_perfumes(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  perfume_id UUID,
  quantity INT,
  created_at TIMESTAMPTZ,
  perfume JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.perfume_id,
    c.quantity,
    c.created_at,
    row_to_json(p)::jsonb AS perfume
  FROM 
    cart c
    JOIN perfumes p ON c.perfume_id = p.id
  WHERE 
    c.user_id = user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION update_cart_item(cart_id UUID, new_quantity INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cart
  SET quantity = new_quantity
  WHERE id = cart_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION delete_cart_item(cart_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM cart
  WHERE id = cart_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION create_order_with_items(
  user_uuid UUID,
  cart_items JSONB,
  order_total DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_id UUID;
  item_record RECORD;
BEGIN
  -- Create the order
  INSERT INTO orders (user_id, total)
  VALUES (user_uuid, order_total)
  RETURNING id INTO order_id;
  
  -- Create order items
  FOR item_record IN SELECT * FROM jsonb_to_recordset(cart_items) AS items(perfume_id UUID, quantity INT, price DECIMAL)
  LOOP
    INSERT INTO order_items (order_id, perfume_id, quantity, price)
    VALUES (order_id, item_record.perfume_id, item_record.quantity, item_record.price);
  END LOOP;
  
  -- Clear the cart
  DELETE FROM cart WHERE user_id = user_uuid;
  
  RETURN order_id;
END;
$$;
*/
