import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { InventoryMovementPoint } from '@/hooks/useAnalyticsData';

const InventoryMovementChart: React.FC<{ data: InventoryMovementPoint[] }> = ({ data }) => {
  const [scale, setScale] = useState<'linear' | 'log'>('linear');
  const max = Math.max(0, ...data.map((d) => Math.max(d.stockIn, d.stockOut)));
  const min = Math.min(...data.flatMap((d) => [d.stockIn, d.stockOut].filter((v) => v > 0)));
  const wideRange = max > 0 && min > 0 && max / min > 50;
  const hasData = data.some((d) => d.stockIn > 0 || d.stockOut > 0);

  return (
    <div className="rounded-lg border border-gold/20 bg-darker p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-xl text-gold">Inventory Movement</h3>
        {wideRange && (
          <div className="flex gap-1 rounded-md border border-gold/20 p-1">
            {(['linear', 'log'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setScale(m)}
                className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${
                  scale === m ? 'bg-gold text-dark' : 'text-gold/70 hover:text-gold'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
      {!hasData ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No inventory movement yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 30% 60% / 0.18)" vertical={false} />
            <XAxis dataKey="label" stroke="hsl(45 30% 80%)" fontSize={11} tickMargin={6} />
            <YAxis
              stroke="hsl(45 30% 80%)"
              fontSize={11}
              scale={scale}
              domain={scale === 'log' ? [1, 'auto'] : [0, 'auto']}
              allowDataOverflow={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)}
            />
            <Tooltip
              cursor={{ fill: 'hsl(45 60% 50% / 0.08)' }}
              contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(45 60% 50% / 0.4)', borderRadius: 8, color: 'hsl(45 90% 80%)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="stockIn" name="Stock In" fill="hsl(150 70% 55%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="stockOut" name="Stock Out" fill="hsl(0 80% 65%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InventoryMovementChart;
