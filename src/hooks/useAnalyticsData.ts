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
  isAnomaly?: boolean;
  anomalyPct?: number;
}

export interface ProductPerformance {
  perfumeId: string;
  name: string;
  quantity: number;
  revenue: number;
  revenueShare: number; // 0..1
  cumulativeShare: number; // 0..1
}

export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
}

export interface KpiSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  revenueGrowthPct: number | null;
  ordersGrowthPct: number | null;
  unitsGrowthPct: number | null;
  prevRevenue: number;
  prevOrders: number;
  prevUnits: number;
  revenueSpark: number[];
  ordersSpark: number[];
  unitsSpark: number[];
  aov: number;
  prevAov: number;
  aovGrowthPct: number | null;
}

export interface PeakActivity {
  day: number | null;
  hour: number | null;
  dayName: string;
  count: number;
  busiestDay: { day: number; name: string; count: number } | null;
  busiestHourBlock: string | null;
}

export interface AnalyticsData {
  monthlyRevenue: MonthlyRevenuePoint[];
  inventoryMovement: InventoryMovementPoint[];
  productPerformance: ProductPerformance[];
  heatmap: HeatmapCell[];
  totals: KpiSummary;
  peak: PeakActivity;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

const pct = (cur: number, prev: number): number | null =>
  prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : null;

export const useAnalyticsData = () => {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      const { data: result, error: fnError } = await supabase.functions.invoke('admin-analytics', {
        headers: { 'x-admin-password': 'SenteurSAF@2025' },
      });
      if (fnError) throw fnError;

      const payments = result?.payments || [];
      const logs = result?.logs || [];
      const perfumes = result?.perfumes || [];
      const orderItems = result?.orderItems || [];
      const perfumeMap = new Map(perfumes.map((p: any) => [p.id, p]));

      // ---- Monthly revenue ----
      const revByMonth = new Map<string, { revenue: number; orders: number; units: number }>();
      payments.forEach((p: any) => {
        const k = monthKey(new Date(p.created_at));
        const cur = revByMonth.get(k) || { revenue: 0, orders: 0, units: 0 };
        cur.revenue += Number(p.amount) || 0;
        cur.orders += 1;
        revByMonth.set(k, cur);
      });
      // attach units per month (using order_items where order paid month — we approximate by created_at on order_items)
      orderItems.forEach((it: any) => {
        if (!it.created_at) return;
        const k = monthKey(new Date(it.created_at));
        const cur = revByMonth.get(k);
        if (cur) cur.units += Number(it.quantity) || 0;
      });

      const fillMonths = (keys: string[]): string[] => {
        if (keys.length < 2) return keys;
        const [sy, sm] = keys[0].split('-').map(Number);
        const [ey, em] = keys[keys.length - 1].split('-').map(Number);
        const out: string[] = [];
        let y = sy, m = sm;
        while (y < ey || (y === ey && m <= em)) {
          out.push(`${y}-${String(m).padStart(2, '0')}`);
          m++;
          if (m > 12) { m = 1; y++; }
        }
        return out;
      };

      const sortedMonths = fillMonths(Array.from(revByMonth.keys()).sort());
      const monthlyRevenue: MonthlyRevenuePoint[] = sortedMonths.map((k, i) => {
        const cur = revByMonth.get(k) || { revenue: 0, orders: 0, units: 0 };
        const prev = i > 0 ? (revByMonth.get(sortedMonths[i - 1])?.revenue ?? 0) : 0;
        return {
          month: k,
          label: monthLabel(k),
          revenue: cur.revenue,
          orders: cur.orders,
          growthPct: pct(cur.revenue, prev),
        };
      });

      // ---- Inventory movement with anomaly detection ----
      const movByMonth = new Map<string, { stockIn: number; stockOut: number }>();
      logs.forEach((l: any) => {
        const k = monthKey(new Date(l.created_at));
        const cur = movByMonth.get(k) || { stockIn: 0, stockOut: 0 };
        const qty = Number(l.quantity_change) || 0;
        if (qty > 0) cur.stockIn += qty;
        else cur.stockOut += Math.abs(qty);
        movByMonth.set(k, cur);
      });
      const movMonths = fillMonths(Array.from(movByMonth.keys()).sort());
      const movArr = movMonths.map((k) => ({
        month: k,
        label: monthLabel(k),
        ...(movByMonth.get(k) || { stockIn: 0, stockOut: 0 }),
      }));
      // mark anomaly: stockOut > 4× rolling avg of prior months
      const inventoryMovement: InventoryMovementPoint[] = movArr.map((p, i) => {
        if (i === 0) return p;
        const prior = movArr.slice(0, i).map((x) => x.stockOut).filter((v) => v > 0);
        if (prior.length === 0) return p;
        const avg = prior.reduce((s, v) => s + v, 0) / prior.length;
        if (p.stockOut > avg * 4 && p.stockOut > 10) {
          return { ...p, isAnomaly: true, anomalyPct: ((p.stockOut - avg) / avg) * 100 };
        }
        return p;
      });

      // ---- Product performance with revenue share + Pareto cumulative ----
      const perfStats = new Map<string, { quantity: number; revenue: number }>();
      orderItems.forEach((it: any) => {
        const cur = perfStats.get(it.perfume_id) || { quantity: 0, revenue: 0 };
        cur.quantity += Number(it.quantity) || 0;
        cur.revenue += (Number(it.price) || 0) * (Number(it.quantity) || 0);
        perfStats.set(it.perfume_id, cur);
      });
      const totalProdRevenue = Array.from(perfStats.values()).reduce((s, v) => s + v.revenue, 0) || 1;
      const sortedProd = Array.from(perfStats.entries())
        .map(([id, s]) => ({
          perfumeId: id,
          name: (perfumeMap.get(id) as any)?.name || 'Unknown',
          quantity: s.quantity,
          revenue: s.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue);
      let cum = 0;
      const productPerformance: ProductPerformance[] = sortedProd.map((p) => {
        const share = p.revenue / totalProdRevenue;
        cum += share;
        return { ...p, revenueShare: share, cumulativeShare: cum };
      });

      // ---- Heatmap + peak detection ----
      const heatMap = new Map<string, number>();
      logs.forEach((l: any) => {
        const d = new Date(l.created_at);
        const key = `${d.getDay()}-${d.getHours()}`;
        heatMap.set(key, (heatMap.get(key) || 0) + 1);
      });
      const heatmap: HeatmapCell[] = [];
      let peakCell: HeatmapCell | null = null;
      const dayTotals: number[] = Array(7).fill(0);
      const hourTotals: number[] = Array(24).fill(0);
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const count = heatMap.get(`${day}-${hour}`) || 0;
          heatmap.push({ day, hour, count });
          dayTotals[day] += count;
          hourTotals[hour] += count;
          if (!peakCell || count > peakCell.count) peakCell = { day, hour, count };
        }
      }
      const busiestDayIdx = dayTotals.reduce((bi, v, i, a) => (v > a[bi] ? i : bi), 0);
      const busiestDay = dayTotals[busiestDayIdx] > 0
        ? { day: busiestDayIdx, name: DAYS[busiestDayIdx], count: dayTotals[busiestDayIdx] }
        : null;
      // busiest 3-hour block
      let bestBlockStart = -1, bestBlockSum = 0;
      for (let h = 0; h <= 21; h++) {
        const sum = hourTotals[h] + hourTotals[h + 1] + hourTotals[h + 2];
        if (sum > bestBlockSum) { bestBlockSum = sum; bestBlockStart = h; }
      }
      const fmtHour = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? 'AM' : 'PM'}`;
      const busiestHourBlock = bestBlockStart >= 0 && bestBlockSum > 0
        ? `${fmtHour(bestBlockStart)}–${fmtHour(bestBlockStart + 3)}`
        : null;

      const peak: PeakActivity = {
        day: peakCell?.day ?? null,
        hour: peakCell?.hour ?? null,
        dayName: peakCell ? DAYS[peakCell.day] : '',
        count: peakCell?.count ?? 0,
        busiestDay,
        busiestHourBlock,
      };

      // ---- KPI totals + comparisons ----
      const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
      const totalOrders = monthlyRevenue.reduce((s, m) => s + m.orders, 0);
      const totalUnitsSold = orderItems.reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0);

      const last = monthlyRevenue.at(-1);
      const prev = monthlyRevenue.length >= 2 ? monthlyRevenue.at(-2) : undefined;
      const prevRevenue = prev?.revenue ?? 0;
      const prevOrders = prev?.orders ?? 0;
      const prevUnits = prev ? (revByMonth.get(prev.month)?.units ?? 0) : 0;
      const lastUnits = last ? (revByMonth.get(last.month)?.units ?? 0) : 0;

      const revenueSpark = monthlyRevenue.slice(-6).map((m) => m.revenue);
      const ordersSpark = monthlyRevenue.slice(-6).map((m) => m.orders);
      const unitsSpark = monthlyRevenue.slice(-6).map((m) => revByMonth.get(m.month)?.units ?? 0);

      const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;

      return {
        monthlyRevenue,
        inventoryMovement,
        productPerformance,
        heatmap,
        peak,
        totals: {
          totalRevenue,
          totalOrders,
          totalUnitsSold,
          revenueGrowthPct: last ? pct(last.revenue, prevRevenue) : null,
          ordersGrowthPct: last ? pct(last.orders, prevOrders) : null,
          unitsGrowthPct: last ? pct(lastUnits, prevUnits) : null,
          prevRevenue,
          prevOrders,
          prevUnits,
          revenueSpark,
          ordersSpark,
          unitsSpark,
          aov,
          prevAov,
          aovGrowthPct: pct(aov, prevAov),
        },
      };
    },
    staleTime: 60_000,
  });
};
