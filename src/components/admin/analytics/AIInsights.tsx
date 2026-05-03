import React from 'react';
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { AnalyticsData } from '@/hooks/useAnalyticsData';

interface Insight {
  type: 'positive' | 'negative' | 'warning' | 'info';
  text: string;
}

const buildInsights = (d: AnalyticsData): Insight[] => {
  const out: Insight[] = [];
  const last = d.monthlyRevenue.at(-1);
  if (last?.growthPct != null) {
    if (last.growthPct >= 5)
      out.push({ type: 'positive', text: `Revenue increased by ${last.growthPct.toFixed(1)}% this month.` });
    else if (last.growthPct <= -5)
      out.push({ type: 'negative', text: `Revenue dropped by ${Math.abs(last.growthPct).toFixed(1)}% this month.` });
    else
      out.push({ type: 'info', text: `Revenue is flat (${last.growthPct.toFixed(1)}% vs last month).` });
  }

  // Top product
  const top = d.productPerformance[0];
  if (top) {
    out.push({
      type: 'positive',
      text: `Best seller: "${top.name}" — ${top.quantity} units sold (AED ${top.revenue.toFixed(2)}).`,
    });
  }

  // Demand surge: compare last 2 months of inventory stockOut
  const mov = d.inventoryMovement;
  if (mov.length >= 2) {
    const a = mov[mov.length - 2].stockOut;
    const b = mov[mov.length - 1].stockOut;
    if (a > 0) {
      const change = ((b - a) / a) * 100;
      if (change >= 25)
        out.push({ type: 'positive', text: `Demand surged by ${change.toFixed(0)}% this month (stock-out volume).` });
      else if (change <= -25)
        out.push({ type: 'warning', text: `Unusual drop in outbound stock detected (${change.toFixed(0)}%).` });
    }
  }

  if (d.totals.totalOrders > 0) {
    const aov = d.totals.totalRevenue / d.totals.totalOrders;
    out.push({ type: 'info', text: `Average order value: AED ${aov.toFixed(2)} across ${d.totals.totalOrders} orders.` });
  }

  if (out.length === 0) {
    out.push({ type: 'info', text: 'Not enough data yet to surface trends. Insights will appear as orders flow in.' });
  }
  return out;
};

const iconFor = (t: Insight['type']) => {
  if (t === 'positive') return <TrendingUp size={16} className="text-emerald-400" />;
  if (t === 'negative') return <TrendingDown size={16} className="text-rose-400" />;
  if (t === 'warning') return <AlertTriangle size={16} className="text-amber-400" />;
  return <Sparkles size={16} className="text-gold" />;
};

const AIInsights: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const insights = buildInsights(data);
  return (
    <div className="rounded-lg border border-gold/20 bg-gradient-to-br from-dark/80 to-dark/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-gold" />
        <h3 className="font-serif text-xl text-gold">AI Insights</h3>
      </div>
      <ul className="space-y-3">
        {insights.map((i, idx) => (
          <li key={idx} className="flex items-start gap-3 rounded-md border border-gold/10 bg-dark/40 p-3 text-sm text-gold/90">
            <span className="mt-0.5">{iconFor(i.type)}</span>
            <span>{i.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AIInsights;
