import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell,
} from 'recharts';
import { AlertTriangle, Info } from 'lucide-react';
import { InventoryMovementPoint } from '@/hooks/useAnalyticsData';

const InventoryMovementChart: React.FC<{ data: InventoryMovementPoint[] }> = ({ data }) => {
  const [scale, setScale] = useState<'linear' | 'log'>('linear');
  const [stacked, setStacked] = useState(true);
  const max = Math.max(0, ...data.map((d) => Math.max(d.stockIn, d.stockOut)));
  const min = Math.min(...data.flatMap((d) => [d.stockIn, d.stockOut].filter((v) => v > 0)));
  const wideRange = max > 0 && min > 0 && max / min > 50;
  const hasData = data.some((d) => d.stockIn > 0 || d.stockOut > 0);
  const anomaly = data.find((d) => d.isAnomaly);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl text-gray-900">Inventory Movement</h3>
          <p className="text-[11px] text-muted-foreground">Stock in vs. stock out by month</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-md border border-gray-200 p-1">
            {(['stacked', 'grouped'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setStacked(m === 'stacked')}
                className={`rounded px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                  (stacked && m === 'stacked') || (!stacked && m === 'grouped')
                    ? 'bg-gray-900 text-dark' : 'text-gray-500 hover:text-gold'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {wideRange && (
            <div className="group relative flex gap-1 rounded-md border border-gray-200 p-1">
              {(['linear', 'log'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setScale(m)}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                    scale === m ? 'bg-gray-900 text-dark' : 'text-gray-500 hover:text-gold'
                  }`}
                >
                  {m}
                </button>
              ))}
              <span className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden w-56 rounded-md border border-gray-200 bg-white p-2 text-[10px] text-gold/80 shadow-lg group-hover:block">
                <Info size={10} className="mr-1 inline" />
                Log scale lets small and large values be compared on the same axis.
              </span>
            </div>
          )}
        </div>
      </div>

      {anomaly && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Unusual stock-out spike</span> in {anomaly.label}:
            {' '}{anomaly.stockOut} units (+{anomaly.anomalyPct?.toFixed(0)}% vs prior avg).
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No inventory movement yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 30% 60% / 0.15)" vertical={false} />
            <XAxis dataKey="label" stroke="hsl(45 30% 80%)" fontSize={11} tickMargin={6} />
            <YAxis
              stroke="hsl(45 30% 80%)"
              fontSize={11}
              width={48}
              scale={scale}
              domain={scale === 'log' ? [1, 'auto'] : [0, 'auto']}
              allowDataOverflow={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)}
            />
            <Tooltip
              cursor={{ fill: 'hsl(45 60% 50% / 0.06)' }}
              contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(45 60% 50% / 0.4)', borderRadius: 8, color: 'hsl(45 90% 80%)', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="circle" />
            <Bar dataKey="stockIn" name="Stock In" fill="hsl(150 70% 55%)" radius={[4, 4, 0, 0]} stackId={stacked ? 'mv' : undefined} />
            <Bar dataKey="stockOut" name="Stock Out" radius={[4, 4, 0, 0]} stackId={stacked ? 'mv' : undefined}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.isAnomaly ? 'hsl(35 95% 60%)' : 'hsl(0 75% 65%)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InventoryMovementChart;
