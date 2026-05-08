import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  delta?: number | null;
  hint?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, delta, hint }) => {
  const showDelta = delta !== undefined && delta !== null;
  const positive = (delta ?? 0) > 0;
  const negative = (delta ?? 0) < 0;
  const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  const color = positive ? 'text-emerald-400' : negative ? 'text-rose-400' : 'text-muted-foreground';

  return (
    <div className="rounded-lg border border-gold/20 bg-darker p-5 transition-all hover:border-gold/40">
      <div className="text-xs uppercase tracking-wider text-gold/70">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gold">{value}</div>
      {showDelta && (
        <div className={`mt-2 flex items-center gap-1 text-sm ${color}`}>
          <Icon size={14} />
          <span>{Math.abs(delta!).toFixed(1)}% vs prev month</span>
        </div>
      )}
      {hint && !showDelta && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
};

export default MetricCard;
