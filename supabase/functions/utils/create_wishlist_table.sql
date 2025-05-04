
-- Create wishlist table and functions
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  perfume_id UUID NOT NULL REFERENCES public.perfumes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist items" 
  ON public.wishlist 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" 
  ON public.wishlist 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" 
  ON public.wishlist 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to get wishlist items with perfume details
CREATE OR REPLACE FUNCTION get_wishlist_with_perfumes(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  perfume_id UUID,
  created_at TIMESTAMPTZ,
  perfume JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.user_id,
    w.perfume_id,
    w.created_at,
    row_to_json(p)::jsonb AS perfume
  FROM 
    wishlist w
    JOIN perfumes p ON w.perfume_id = p.id
  WHERE 
    w.user_id = user_uuid;
END;
$$;
