import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calcReorderPoint, calcReorderQty } from '@/services/inventoryActionService';

export interface InventoryRow {
  id: string;
  perfume_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  lead_time_days: number;
  safety_stock: number;
  avg_daily_usage: number;
  updated_at: string;
  perfumes: { id: string; name: string; price: string } | null;
  // computed
  outflow30: number;
  avgDaily: number;
  reorderPoint: number;
  reorderQty: number;
  status: 'critical' | 'low' | 'normal';
  lastMovementAt: string | null;
  daysSinceMovement: number | null;
}

export const useInventoryWithInsights = () => {
  return useQuery({
    queryKey: ['inventory-insights'],
    queryFn: async (): Promise<InventoryRow[]> => {
      const { data: inv, error } = await supabase
        .from('inventory')
        .select(`*, perfumes (id, name, price)`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: logs, error: logErr } = await supabase
        .from('inventory_logs')
        .select('perfume_id, quantity_change, created_at')
        .gte('created_at', since);
      if (logErr) throw logErr;

      const outflowMap = new Map<string, number>();
      const lastMoveMap = new Map<string, string>();
      for (const l of logs || []) {
        if (l.quantity_change < 0) {
          outflowMap.set(l.perfume_id, (outflowMap.get(l.perfume_id) || 0) + Math.abs(l.quantity_change));
        }
        const prev = lastMoveMap.get(l.perfume_id);
        if (!prev || l.created_at > prev) lastMoveMap.set(l.perfume_id, l.created_at);
      }

      return (inv || []).map((row: any) => {
        const outflow30 = outflowMap.get(row.perfume_id) || 0;
        const avgDaily = outflow30 / 30;
        const reorderPoint = calcReorderPoint(avgDaily, row.lead_time_days, row.safety_stock);
        const reorderQty = calcReorderQty(avgDaily, row.lead_time_days, row.safety_stock);
        const status: InventoryRow['status'] =
          row.stock_quantity === 0 ? 'critical' :
          row.stock_quantity <= reorderPoint ? 'low' : 'normal';
        const lastMovementAt = lastMoveMap.get(row.perfume_id) || null;
        const daysSinceMovement = lastMovementAt
          ? Math.floor((Date.now() - new Date(lastMovementAt).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        return {
          ...row,
          outflow30,
          avgDaily,
          reorderPoint,
          reorderQty,
          status,
          lastMovementAt,
          daysSinceMovement,
        };
      });
    },
    refetchInterval: 15000,
  });
};
