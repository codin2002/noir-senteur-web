import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  delta?: number | null;
  prevValue?: string;
  spark?: number[];
  hint?: string;
}

const Sparkline: React.FC<{ data: number[]; positive: boolean }> = ({ data, positive }) => {
  if (!data || data.length < 2) return null;
  const w = 90, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const stroke = positive ? 'hsl(150 70% 55%)' : 'hsl(0 75% 65%)';
  const fill = positive ? 'hsl(150 70% 55% / 0.18)' : 'hsl(0 75% 65% / 0.18)';
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={fill} stroke="none" />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, delta, prevValue, spark, hint }) => {
  const showDelta = delta !== undefined && delta !== null;
  const positive = (delta ?? 0) > 0;
  const negative = (delta ?? 0) < 0;
  const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  const color = positive ? 'text-emerald-400' : negative ? 'text-rose-400' : 'text-muted-foreground';
  const dotColor = positive ? 'bg-emerald-400' : negative ? 'bg-rose-400' : 'bg-muted';

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-darker p-4 transition-all hover:border-gray-300">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{label}</div>
        {showDelta && (
          <div className={`flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold ${color}`}>
            <Icon size={11} strokeWidth={2.5} />
            {Math.abs(delta!).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-gold">{value}</div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          {showDelta && prevValue ? (
            <>vs <span className="text-gray-500">{prevValue}</span> last month</>
          ) : hint ? (
            hint
          ) : null}
        </div>
        {spark && spark.length > 1 && <Sparkline data={spark} positive={!negative} />}
      </div>
      <span className={`absolute left-0 top-0 h-full w-[3px] ${dotColor} opacity-60`} />
    </div>
  );
};

export default MetricCard;
