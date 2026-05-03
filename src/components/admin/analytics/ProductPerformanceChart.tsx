import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { ProductPerformance } from '@/hooks/useAnalyticsData';

const ProductPerformanceChart: React.FC<{ data: ProductPerformance[] }> = ({ data }) => {
  const [mode, setMode] = useState<'quantity' | 'revenue'>('quantity');
  const top = [...data]
    .sort((a, b) => (mode === 'quantity' ? b.quantity - a.quantity : b.revenue - a.revenue))
    .slice(0, 5);

  return (
    <div className="rounded-lg border border-gold/20 bg-dark/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-xl text-gold">Top 5 Products</h3>
        <div className="flex gap-1 rounded-md border border-gold/20 p-1">
          {(['quantity', 'revenue'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-xs transition ${
                mode === m ? 'bg-gold text-dark' : 'text-gold/70 hover:text-gold'
              }`}
            >
              By {m}
            </button>
          ))}
        </div>
      </div>
      {top.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No sales data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={top} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gold) / 0.1)" />
            <XAxis type="number" stroke="hsl(var(--gold) / 0.6)" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--gold) / 0.6)" fontSize={12} width={80} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--gold) / 0.3)',
                borderRadius: 8,
              }}
              formatter={(v: number) => mode === 'revenue' ? `AED ${v.toFixed(2)}` : v}
            />
            <Bar dataKey={mode} fill="hsl(var(--gold))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductPerformanceChart;
