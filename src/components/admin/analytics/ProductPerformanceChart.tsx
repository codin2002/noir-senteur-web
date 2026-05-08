import React, { useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { ProductPerformance } from '@/hooks/useAnalyticsData';

const truncate = (s: string, n = 16) => (s.length > n ? `${s.slice(0, n)}…` : s);

const ProductPerformanceChart: React.FC<{ data: ProductPerformance[] }> = ({ data }) => {
  const [mode, setMode] = useState<'pareto' | 'cards'>('pareto');
  const top = data.slice(0, 8).map((d) => ({
    ...d,
    displayName: truncate(d.name),
    cumulativePct: d.cumulativeShare * 100,
  }));

  return (
    <div className="rounded-lg border border-gold/20 bg-darker p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-gold">Top Products</h3>
          <p className="text-[11px] text-muted-foreground">Revenue contribution & cumulative share</p>
        </div>
        <div className="flex gap-1 rounded-md border border-gold/20 p-1">
          {(['pareto', 'cards'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${
                mode === m ? 'bg-gold text-dark' : 'text-gold/70 hover:text-gold'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {top.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No sales data yet</div>
      ) : mode === 'pareto' ? (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={top} margin={{ top: 4, right: 50, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 30% 60% / 0.15)" vertical={false} />
            <XAxis
              dataKey="displayName"
              stroke="hsl(45 30% 80%)"
              fontSize={10}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis
              yAxisId="rev"
              stroke="hsl(45 30% 80%)"
              fontSize={11}
              width={58}
              tickFormatter={(v) => v >= 1000 ? `AED ${(v/1000).toFixed(1)}k` : `AED ${v}`}
            />
            <YAxis
              yAxisId="pct"
              orientation="right"
              stroke="hsl(150 70% 55%)"
              fontSize={11}
              width={42}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(45 60% 50% / 0.06)' }}
              contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(45 60% 50% / 0.4)', borderRadius: 8, color: 'hsl(45 90% 80%)', fontSize: 12 }}
              formatter={(v: number, name) => {
                if (name === 'revenue') return [`AED ${v.toFixed(2)}`, 'Revenue'];
                if (name === 'cumulativePct') return [`${v.toFixed(1)}%`, 'Cumulative'];
                return [v, name];
              }}
              labelFormatter={(_l, payload) => (payload?.[0]?.payload as any)?.name ?? ''}
            />
            <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill="hsl(45 90% 60%)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="pct" type="monotone" dataKey="cumulativePct" name="Cumulative" stroke="hsl(150 70% 55%)" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="space-y-2">
          {top.map((p, i) => (
            <div key={p.perfumeId} className="flex items-center gap-3 rounded-md border border-gold/10 bg-dark/40 p-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold">
                #{i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gold" dir="auto">{p.name}</div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-dark">
                  <div className="h-full bg-gradient-to-r from-gold/70 to-gold" style={{ width: `${p.revenueShare * 100}%` }} />
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-semibold text-gold">AED {p.revenue.toFixed(0)}</div>
                <div className="text-[11px] text-muted-foreground">{p.quantity} units · {(p.revenueShare * 100).toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPerformanceChart;
