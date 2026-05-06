
-- Extend perfumes
ALTER TABLE public.perfumes
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS preorder_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preorder_start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preorder_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expected_shipping_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preorder_limit INTEGER,
  ADD COLUMN IF NOT EXISTS preorder_count INTEGER NOT NULL DEFAULT 0;

-- Extend inventory
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS reserved_stock INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS incoming_stock INTEGER NOT NULL DEFAULT 0;

-- Extend orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- Extend order_items
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN NOT NULL DEFAULT false;

-- New fulfillment table
CREATE TABLE IF NOT EXISTS public.preorder_fulfillments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID NOT NULL,
  preorder_id UUID,
  perfume_id UUID NOT NULL,
  fulfilled_quantity INTEGER NOT NULL DEFAULT 0,
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.preorder_fulfillments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view preorder fulfillments"
  ON public.preorder_fulfillments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert preorder fulfillments"
  ON public.preorder_fulfillments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update preorder fulfillments"
  ON public.preorder_fulfillments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete preorder fulfillments"
  ON public.preorder_fulfillments FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_preorder_fulfillments_order_item ON public.preorder_fulfillments(order_item_id);
CREATE INDEX IF NOT EXISTS idx_preorder_fulfillments_perfume ON public.preorder_fulfillments(perfume_id);
CREATE INDEX IF NOT EXISTS idx_order_items_is_preorder ON public.order_items(is_preorder) WHERE is_preorder = true;
CREATE INDEX IF NOT EXISTS idx_orders_is_preorder ON public.orders(is_preorder) WHERE is_preorder = true;

CREATE TRIGGER update_preorder_fulfillments_updated_at
  BEFORE UPDATE ON public.preorder_fulfillments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_updated_at();

-- FIFO fulfillment RPC: receive incoming stock and fulfill oldest preorders first
CREATE OR REPLACE FUNCTION public.receive_stock_and_fulfill_preorders(
  _perfume_id UUID,
  _quantity INTEGER,
  _notes TEXT DEFAULT NULL
)
RETURNS TABLE(fulfilled_items INTEGER, remaining_stock INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining INTEGER := _quantity;
  fulfilled INTEGER := 0;
  item RECORD;
  take INTEGER;
  unfulfilled INTEGER;
BEGIN
  -- Add to available stock first
  UPDATE public.inventory
    SET stock_quantity = stock_quantity + _quantity,
        incoming_stock = GREATEST(incoming_stock - _quantity, 0)
    WHERE perfume_id = _perfume_id;

  -- FIFO: walk preorder order_items oldest first
  FOR item IN
    SELECT oi.id, oi.quantity, oi.order_id,
      COALESCE((SELECT SUM(fulfilled_quantity) FROM public.preorder_fulfillments WHERE order_item_id = oi.id), 0) AS already
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.perfume_id = _perfume_id
      AND oi.is_preorder = true
      AND o.status NOT IN ('cancelled', 'shipped', 'delivered')
    ORDER BY o.created_at ASC
  LOOP
    EXIT WHEN remaining <= 0;
    unfulfilled := item.quantity - item.already;
    IF unfulfilled <= 0 THEN CONTINUE; END IF;

    take := LEAST(unfulfilled, remaining);

    INSERT INTO public.preorder_fulfillments (order_item_id, perfume_id, fulfilled_quantity, fulfilled_at, notes)
    VALUES (item.id, _perfume_id, take, now(), _notes);

    -- deduct from available stock and reserved stock
    UPDATE public.inventory
      SET stock_quantity = stock_quantity - take,
          reserved_stock = GREATEST(reserved_stock - take, 0)
      WHERE perfume_id = _perfume_id;

    remaining := remaining - take;
    fulfilled := fulfilled + take;

    -- if this order_item is now fully fulfilled, check if order is ready_to_ship
    IF (item.already + take) >= item.quantity THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.order_items oi2
        WHERE oi2.order_id = item.order_id
          AND oi2.is_preorder = true
          AND oi2.quantity > COALESCE((SELECT SUM(fulfilled_quantity) FROM public.preorder_fulfillments WHERE order_item_id = oi2.id), 0)
      ) THEN
        UPDATE public.orders SET status = 'ready_to_ship' WHERE id = item.order_id;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT fulfilled, remaining;
END;
$$;

-- Cancel a preorder order: free reserved stock & decrement perfume preorder_count
CREATE OR REPLACE FUNCTION public.cancel_preorder_order(_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
  unfulfilled INTEGER;
BEGIN
  FOR item IN
    SELECT oi.id, oi.perfume_id, oi.quantity,
      COALESCE((SELECT SUM(fulfilled_quantity) FROM public.preorder_fulfillments WHERE order_item_id = oi.id), 0) AS already
    FROM public.order_items oi
    WHERE oi.order_id = _order_id AND oi.is_preorder = true
  LOOP
    unfulfilled := GREATEST(item.quantity - item.already, 0);
    IF unfulfilled > 0 THEN
      UPDATE public.inventory
        SET reserved_stock = GREATEST(reserved_stock - unfulfilled, 0)
        WHERE perfume_id = item.perfume_id;
      UPDATE public.perfumes
        SET preorder_count = GREATEST(preorder_count - unfulfilled, 0)
        WHERE id = item.perfume_id;
    END IF;
  END LOOP;

  UPDATE public.orders SET status = 'cancelled' WHERE id = _order_id;
END;
$$;
