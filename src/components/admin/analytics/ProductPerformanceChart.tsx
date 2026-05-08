import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { ProductPerformance } from '@/hooks/useAnalyticsData';

const truncate = (s: string, n = 14) => (s.length > n ? `${s.slice(0, n)}…` : s);

const ProductPerformanceChart: React.FC<{ data: ProductPerformance[] }> = ({ data }) => {
  const [mode, setMode] = useState<'quantity' | 'revenue'>('quantity');
  const top = [...data]
    .sort((a, b) => (mode === 'quantity' ? b.quantity - a.quantity : b.revenue - a.revenue))
    .slice(0, 5)
    .map((d) => ({ ...d, displayName: truncate(d.name) }));

  return (
    <div className="rounded-lg border border-gold/20 bg-darker p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-xl text-gold">Top 5 Products</h3>
        <div className="flex gap-1 rounded-md border border-gold/20 p-1">
          {(['quantity', 'revenue'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                mode === m ? 'bg-gold text-dark' : 'text-gold/70 hover:text-gold'
              }`}
            >
              By {m}
            </button>
          ))}
        </div>
      </div>
      {top.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No sales data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={top} layout="vertical" margin={{ top: 10, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 30% 60% / 0.18)" horizontal={false} />
            <XAxis
              type="number"
              stroke="hsl(45 30% 80%)"
              fontSize={11}
              tickFormatter={(v) => mode === 'revenue' && v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)}
            />
            <YAxis
              dataKey="displayName"
              type="category"
              stroke="hsl(45 30% 80%)"
              fontSize={11}
              width={110}
              tick={{ fill: 'hsl(45 80% 75%)' }}
            />
            <Tooltip
              cursor={{ fill: 'hsl(45 60% 50% / 0.08)' }}
              contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(45 60% 50% / 0.4)', borderRadius: 8, color: 'hsl(45 90% 80%)' }}
              formatter={(v: number) => mode === 'revenue' ? `AED ${v.toFixed(2)}` : v}
              labelFormatter={(_l, payload) => (payload?.[0]?.payload as any)?.name ?? ''}
            />
            <Bar dataKey={mode} fill="hsl(45 90% 60%)" radius={[0, 4, 4, 0]} minPointSize={3} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductPerformanceChart;
