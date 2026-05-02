-- Extend inventory with per-product reorder config
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS lead_time_days integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS safety_stock integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS avg_daily_usage numeric NOT NULL DEFAULT 0;

-- Extend inventory_logs with new structured fields
ALTER TABLE public.inventory_logs
  ADD COLUMN IF NOT EXISTS action_category text,
  ADD COLUMN IF NOT EXISTS reference_id text,
  ADD COLUMN IF NOT EXISTS user_name text,
  ADD COLUMN IF NOT EXISTS is_unusual boolean NOT NULL DEFAULT false;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON public.inventory_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_perfume_id ON public.inventory_logs (perfume_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_action_category ON public.inventory_logs (action_category);
