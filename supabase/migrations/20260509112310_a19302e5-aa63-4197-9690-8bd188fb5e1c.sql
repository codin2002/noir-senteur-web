
-- 1. INVENTORY: remove public write policies, restrict to admins
DROP POLICY IF EXISTS "Public can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Public can update inventory" ON public.inventory;

CREATE POLICY "Admins can insert inventory"
ON public.inventory FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inventory"
ON public.inventory FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete inventory"
ON public.inventory FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. INVENTORY LOGS: remove public access, restrict to admins
DROP POLICY IF EXISTS "Public can insert inventory logs" ON public.inventory_logs;
DROP POLICY IF EXISTS "Public can view inventory logs" ON public.inventory_logs;

CREATE POLICY "Admins can view inventory logs"
ON public.inventory_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert inventory logs"
ON public.inventory_logs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. ORDERS / ORDER_ITEMS: add admin SELECT so guest orders are accessible
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
