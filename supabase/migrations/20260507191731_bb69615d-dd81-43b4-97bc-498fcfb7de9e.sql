
-- ============ 1. RBAC infrastructure ============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- ============ 2. inventory: admin-only ============
DROP POLICY IF EXISTS "Allow all operations on inventory" ON public.inventory;
CREATE POLICY "Anyone can view inventory" ON public.inventory
  FOR SELECT USING (true);
CREATE POLICY "Admins can modify inventory" ON public.inventory
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ 3. inventory_logs: admin write, admin read ============
DROP POLICY IF EXISTS "Allow all operations on inventory_logs" ON public.inventory_logs;
CREATE POLICY "Admins can view inventory logs" ON public.inventory_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ 4. newsletter_subscriptions: admin-only read ============
DROP POLICY IF EXISTS "Authenticated users can view newsletter subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Admins can view newsletter subscriptions" ON public.newsletter_subscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ 5. perfume_classifications: admin-only writes ============
DROP POLICY IF EXISTS "Authenticated users can insert perfume classifications" ON public.perfume_classifications;
DROP POLICY IF EXISTS "Authenticated users can update perfume classifications" ON public.perfume_classifications;
DROP POLICY IF EXISTS "Authenticated users can delete perfume classifications" ON public.perfume_classifications;
CREATE POLICY "Admins can insert perfume classifications" ON public.perfume_classifications
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update perfume classifications" ON public.perfume_classifications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete perfume classifications" ON public.perfume_classifications
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ 6. perfume_ratings: admin-only writes ============
DROP POLICY IF EXISTS "Authenticated users can create perfume ratings" ON public.perfume_ratings;
DROP POLICY IF EXISTS "Authenticated users can update perfume ratings" ON public.perfume_ratings;
CREATE POLICY "Admins can insert perfume ratings" ON public.perfume_ratings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update perfume ratings" ON public.perfume_ratings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ 7. pickup_points: admin-only management ============
DROP POLICY IF EXISTS "Authenticated users can manage pickup points" ON public.pickup_points;
CREATE POLICY "Admins can manage pickup points" ON public.pickup_points
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ 8. preorder_fulfillments: admin-only ============
DROP POLICY IF EXISTS "Anyone can view preorder fulfillments" ON public.preorder_fulfillments;
DROP POLICY IF EXISTS "Authenticated users can insert preorder fulfillments" ON public.preorder_fulfillments;
DROP POLICY IF EXISTS "Authenticated users can update preorder fulfillments" ON public.preorder_fulfillments;
DROP POLICY IF EXISTS "Authenticated users can delete preorder fulfillments" ON public.preorder_fulfillments;
CREATE POLICY "Admins can view preorder fulfillments" ON public.preorder_fulfillments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage preorder fulfillments" ON public.preorder_fulfillments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ 9. preorders: tighten ============
DROP POLICY IF EXISTS "Authenticated users can view all preorders" ON public.preorders;
DROP POLICY IF EXISTS "Authenticated users can update preorders" ON public.preorders;
DROP POLICY IF EXISTS "Authenticated users can delete preorders" ON public.preorders;
CREATE POLICY "Admins can view all preorders" ON public.preorders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update preorders" ON public.preorders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete preorders" ON public.preorders
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ 10. successful_payments: service-role only writes ============
DROP POLICY IF EXISTS "Service role can insert payment records" ON public.successful_payments;
DROP POLICY IF EXISTS "Service role can update payment records" ON public.successful_payments;
-- No INSERT/UPDATE policy = only service_role (which bypasses RLS) can write.
-- Existing SELECT policy "Users can view their own payment records" remains.
CREATE POLICY "Admins can view all payments" ON public.successful_payments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ 11. Storage: lock writes to admins, keep public reads ============
DROP POLICY IF EXISTS "Public can read perfume buckets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to public buckets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update public buckets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from public buckets" ON storage.objects;

CREATE POLICY "Public can read public buckets" ON storage.objects
  FOR SELECT USING (bucket_id IN ('perfume1','perfume2','video-hero','logo'));

CREATE POLICY "Admins can upload to public buckets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('perfume1','perfume2','video-hero','logo')
              AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update public buckets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('perfume1','perfume2','video-hero','logo')
         AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete from public buckets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('perfume1','perfume2','video-hero','logo')
         AND public.has_role(auth.uid(), 'admin'));

-- ============ 12. Fix function search_path on existing function lacking it ============
CREATE OR REPLACE FUNCTION public.update_inventory_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
