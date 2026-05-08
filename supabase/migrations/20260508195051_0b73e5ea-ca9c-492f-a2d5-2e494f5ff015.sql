
-- Allow client-side admin (session-gated) to update inventory and insert logs
DROP POLICY IF EXISTS "Admins can modify inventory" ON public.inventory;

CREATE POLICY "Public can update inventory"
ON public.inventory
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can insert inventory"
ON public.inventory
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage inventory logs" ON public.inventory_logs;
DROP POLICY IF EXISTS "Admins can view inventory logs" ON public.inventory_logs;

CREATE POLICY "Public can insert inventory logs"
ON public.inventory_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can view inventory logs"
ON public.inventory_logs
FOR SELECT
USING (true);
