import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyRevenuePoint {
  month: string; // YYYY-MM
  label: string; // Mon YYYY
  revenue: number;
  orders: number;
  growthPct: number | null;
}

export interface InventoryMovementPoint {
  month: string;
  label: string;
  stockIn: number;
  stockOut: number;
}

export interface ProductPerformance {
  perfumeId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface HeatmapCell {
  day: number; // 0-6 (Sun-Sat)
  hour: number; // 0-23
  count: number;
}

export interface AnalyticsData {
  monthlyRevenue: MonthlyRevenuePoint[];
  inventoryMovement: InventoryMovementPoint[];
  productPerformance: ProductPerformance[];
  heatmap: HeatmapCell[];
  totals: {
    totalRevenue: number;
    totalOrders: number;
    revenueGrowthPct: number | null;
    totalUnitsSold: number;
  };
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

export const useAnalyticsData = () => {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      // Pull successful payments (revenue) joined with orders + items
      const [paymentsRes, logsRes, perfumesRes] = await Promise.all([
        supabase
          .from('successful_payments')
          .select('id, amount, created_at, order_id')
          .eq('payment_status', 'completed')
          .order('created_at', { ascending: true }),
        supabase
          .from('inventory_logs')
          .select('id, perfume_id, change_type, quantity_change, created_at')
          .order('created_at', { ascending: true })
          .limit(5000),
        supabase.from('perfumes').select('id, name, price_value'),
      ]);

      const payments = paymentsRes.data || [];
      const logs = logsRes.data || [];
      const perfumes = perfumesRes.data || [];
      const perfumeMap = new Map(perfumes.map((p: any) => [p.id, p]));

      // Order items for product performance
      const orderIds = Array.from(new Set(payments.map((p: any) => p.order_id).filter(Boolean)));
      let orderItems: any[] = [];
      if (orderIds.length) {
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('perfume_id, quantity, price, order_id')
          .in('order_id', orderIds);
        orderItems = itemsData || [];
      }

      // ---- Monthly revenue ----
      const revByMonth = new Map<string, { revenue: number; orders: number }>();
      payments.forEach((p: any) => {
        const k = monthKey(new Date(p.created_at));
        const cur = revByMonth.get(k) || { revenue: 0, orders: 0 };
        cur.revenue += Number(p.amount) || 0;
        cur.orders += 1;
        revByMonth.set(k, cur);
      });
      const sortedMonths = Array.from(revByMonth.keys()).sort();
      const monthlyRevenue: MonthlyRevenuePoint[] = sortedMonths.map((k, i) => {
        const cur = revByMonth.get(k)!;
        const prev = i > 0 ? revByMonth.get(sortedMonths[i - 1])!.revenue : null;
        const growthPct =
          prev && prev > 0 ? ((cur.revenue - prev) / prev) * 100 : null;
        return { month: k, label: monthLabel(k), revenue: cur.revenue, orders: cur.orders, growthPct };
      });

      // ---- Inventory movement ----
      const movByMonth = new Map<string, { stockIn: number; stockOut: number }>();
      logs.forEach((l: any) => {
        const k = monthKey(new Date(l.created_at));
        const cur = movByMonth.get(k) || { stockIn: 0, stockOut: 0 };
        const qty = Number(l.quantity_change) || 0;
        if (qty > 0) cur.stockIn += qty;
        else cur.stockOut += Math.abs(qty);
        movByMonth.set(k, cur);
      });
      const movMonths = Array.from(movByMonth.keys()).sort();
      const inventoryMovement: InventoryMovementPoint[] = movMonths.map((k) => ({
        month: k,
        label: monthLabel(k),
        ...movByMonth.get(k)!,
      }));

      // ---- Product performance (by quantity sold via order_items) ----
      const perfStats = new Map<string, { quantity: number; revenue: number }>();
      orderItems.forEach((it: any) => {
        const cur = perfStats.get(it.perfume_id) || { quantity: 0, revenue: 0 };
        cur.quantity += Number(it.quantity) || 0;
        cur.revenue += (Number(it.price) || 0) * (Number(it.quantity) || 0);
        perfStats.set(it.perfume_id, cur);
      });
      const productPerformance: ProductPerformance[] = Array.from(perfStats.entries())
        .map(([id, s]) => ({
          perfumeId: id,
          name: (perfumeMap.get(id) as any)?.name || 'Unknown',
          quantity: s.quantity,
          revenue: s.revenue,
        }))
        .sort((a, b) => b.quantity - a.quantity);

      // ---- Heatmap (inventory log activity by weekday/hour) ----
      const heatMap = new Map<string, number>();
      logs.forEach((l: any) => {
        const d = new Date(l.created_at);
        const key = `${d.getDay()}-${d.getHours()}`;
        heatMap.set(key, (heatMap.get(key) || 0) + 1);
      });
      const heatmap: HeatmapCell[] = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          heatmap.push({ day, hour, count: heatMap.get(`${day}-${hour}`) || 0 });
        }
      }

      // ---- Totals ----
      const totalRevenue = payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
      const totalOrders = payments.length;
      const totalUnitsSold = orderItems.reduce((s, it: any) => s + (Number(it.quantity) || 0), 0);
      const last = monthlyRevenue.at(-1);
      const revenueGrowthPct = last?.growthPct ?? null;

      return {
        monthlyRevenue,
        inventoryMovement,
        productPerformance,
        heatmap,
        totals: { totalRevenue, totalOrders, revenueGrowthPct, totalUnitsSold },
      };
    },
    staleTime: 60_000,
  });
};
