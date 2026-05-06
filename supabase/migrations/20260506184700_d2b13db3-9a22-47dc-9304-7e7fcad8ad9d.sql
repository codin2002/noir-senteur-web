
CREATE TABLE public.preorders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  perfume_id UUID NOT NULL,
  user_id UUID,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  order_id UUID,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create preorders"
  ON public.preorders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own preorders"
  ON public.preorders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all preorders"
  ON public.preorders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update preorders"
  ON public.preorders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete preorders"
  ON public.preorders FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX idx_preorders_perfume_id ON public.preorders(perfume_id);
CREATE INDEX idx_preorders_user_id ON public.preorders(user_id);
CREATE INDEX idx_preorders_status ON public.preorders(status);
CREATE INDEX idx_preorders_created_at ON public.preorders(created_at DESC);

CREATE TRIGGER update_preorders_updated_at
  BEFORE UPDATE ON public.preorders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_updated_at();
