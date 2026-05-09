-- Restore permissive policies on inventory
DROP POLICY IF EXISTS "Admins can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;

CREATE POLICY "Anyone can insert inventory"
ON public.inventory FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update inventory"
ON public.inventory FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete inventory"
ON public.inventory FOR DELETE TO public USING (true);

-- Restore permissive policies on inventory_logs
DROP POLICY IF EXISTS "Admins can insert inventory logs" ON public.inventory_logs;
DROP POLICY IF EXISTS "Admins can view inventory logs" ON public.inventory_logs;

CREATE POLICY "Anyone can insert inventory logs"
ON public.inventory_logs FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can view inventory logs"
ON public.inventory_logs FOR SELECT TO public USING (true);
