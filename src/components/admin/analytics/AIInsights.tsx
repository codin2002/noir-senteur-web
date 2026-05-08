import React, { useState } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalyticsData } from '@/hooks/useAnalyticsData';

type Severity = 'positive' | 'warning' | 'risk' | 'opportunity' | 'info';
interface Insight {
  severity: Severity;
  title: string;
  detail?: string;
  action?: string;
}

const SEV: Record<Severity, { border: string; chip: string; icon: React.ReactNode; label: string }> = {
  positive:    { border: 'border-l-emerald-400', chip: 'bg-emerald-400/15 text-emerald-300',  icon: <TrendingUp size={14} />,    label: 'Trend' },
  warning:     { border: 'border-l-amber-400',   chip: 'bg-amber-400/15 text-amber-300',      icon: <AlertTriangle size={14} />, label: 'Warning' },
  risk:        { border: 'border-l-rose-400',    chip: 'bg-rose-400/15 text-rose-300',        icon: <TrendingDown size={14} />,  label: 'Risk' },
  opportunity: { border: 'border-l-gold',        chip: 'bg-gold/15 text-gold',                icon: <Lightbulb size={14} />,     label: 'Opportunity' },
  info:        { border: 'border-l-slate-400',   chip: 'bg-slate-400/15 text-slate-300',      icon: <Sparkles size={14} />,      label: 'Info' },
};

const buildInsights = (d: AnalyticsData): Insight[] => {
  const out: Insight[] = [];
  const t = d.totals;

  if (t.revenueGrowthPct != null) {
    if (t.revenueGrowthPct >= 10)
      out.push({ severity: 'positive', title: `Revenue up ${t.revenueGrowthPct.toFixed(1)}% vs last month`, detail: `AED ${t.totalRevenue.toFixed(0)} this period vs AED ${t.prevRevenue.toFixed(0)} previously.` });
    else if (t.revenueGrowthPct <= -10)
      out.push({ severity: 'risk', title: `Revenue down ${Math.abs(t.revenueGrowthPct).toFixed(1)}%`, detail: `Significant drop from AED ${t.prevRevenue.toFixed(0)}.`, action: 'Review marketing spend & top-product stock levels.' });
  }

  // Inventory anomaly
  const anomaly = d.inventoryMovement.find((m) => m.isAnomaly);
  if (anomaly) {
    out.push({
      severity: 'warning',
      title: `Stock-out spike in ${anomaly.label} (+${anomaly.anomalyPct?.toFixed(0)}% vs avg)`,
      detail: `${anomaly.stockOut} units left inventory — possible bulk order or data mismatch.`,
      action: 'Verify large orders & reconcile counts.',
    });
  }

  // Product concentration
  const top = d.productPerformance[0];
  if (top && d.productPerformance.length > 0) {
    const sharePct = top.revenueShare * 100;
    if (sharePct >= 70) {
      out.push({
        severity: 'opportunity',
        title: `${sharePct.toFixed(0)}% of revenue comes from "${top.name}"`,
        detail: 'Heavy dependency on a single product.',
        action: 'Consider expanding catalog or running campaigns for secondary SKUs.',
      });
    } else {
      out.push({ severity: 'positive', title: `Best seller: "${top.name}"`, detail: `${top.quantity} units · AED ${top.revenue.toFixed(0)} (${sharePct.toFixed(0)}% of revenue).` });
    }
  }

  // AOV
  if (t.totalOrders > 0) {
    const detail = t.aovGrowthPct != null
      ? `${t.aovGrowthPct >= 0 ? '+' : ''}${t.aovGrowthPct.toFixed(1)}% vs last month.`
      : `Across ${t.totalOrders} orders.`;
    out.push({ severity: 'info', title: `Average order value: AED ${t.aov.toFixed(2)}`, detail });
  }

  // Peak activity
  if (d.peak.busiestDay && d.peak.busiestHourBlock) {
    out.push({
      severity: 'info',
      title: `Peak activity: ${d.peak.busiestDay.name} ${d.peak.busiestHourBlock}`,
      detail: `Schedule restocks & promotions around this window.`,
    });
  }

  if (out.length === 0) {
    out.push({ severity: 'info', title: 'Not enough data yet', detail: 'Insights will appear as orders flow in.' });
  }
  return out;
};

const AIInsights: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const insights = buildInsights(data);
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="rounded-lg border border-gray-200 bg-darker p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-gray-900" />
        <h3 className="font-serif text-xl text-gold">AI Insights</h3>
        <span className="ml-auto text-[11px] text-muted-foreground">{insights.length} signals</span>
      </div>
      <ul className="space-y-2">
        {insights.map((i, idx) => {
          const meta = SEV[i.severity];
          const isOpen = expanded === idx;
          const hasMore = !!(i.detail || i.action);
          return (
            <li key={idx} className={`rounded-md border border-gray-200 border-l-[3px] ${meta.border} bg-dark/40 transition`}>
              <button
                onClick={() => hasMore && setExpanded(isOpen ? null : idx)}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
              >
                <span className={`mt-0.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.chip}`}>
                  {meta.icon} {meta.label}
                </span>
                <span className="flex-1 text-sm text-gold/95">{i.title}</span>
                {hasMore && (isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />)}
              </button>
              {isOpen && hasMore && (
                <div className="space-y-1.5 border-t border-gray-200 px-3 py-2.5 pl-[88px] text-xs">
                  {i.detail && <div className="text-gray-500">{i.detail}</div>}
                  {i.action && (
                    <div className="text-gold/90">
                      <span className="font-semibold text-gold">→ Recommendation:</span> {i.action}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AIInsights;
