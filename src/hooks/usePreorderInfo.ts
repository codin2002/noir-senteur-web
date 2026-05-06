import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PreorderInfo {
  product_type: string;
  preorder_enabled: boolean;
  preorder_start_date: string | null;
  preorder_end_date: string | null;
  expected_shipping_date: string | null;
  preorder_limit: number | null;
  preorder_count: number;
}

export const isPreorderActive = (info: PreorderInfo | null): boolean => {
  if (!info) return false;
  if (!info.preorder_enabled && info.product_type !== 'preorder') return false;
  const now = Date.now();
  if (info.preorder_start_date && new Date(info.preorder_start_date).getTime() > now) return false;
  if (info.preorder_end_date && new Date(info.preorder_end_date).getTime() < now) return false;
  if (info.preorder_limit != null && info.preorder_count >= info.preorder_limit) return false;
  return true;
};

export const usePreorderInfo = (perfumeId?: string) => {
  const [info, setInfo] = useState<PreorderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!perfumeId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('perfumes')
        .select('product_type, preorder_enabled, preorder_start_date, preorder_end_date, expected_shipping_date, preorder_limit, preorder_count')
        .eq('id', perfumeId)
        .maybeSingle();
      if (!cancelled) {
        setInfo(data as PreorderInfo | null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [perfumeId]);

  return { info, loading, isActive: isPreorderActive(info) };
};
