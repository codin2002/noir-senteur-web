import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { MonthlyRevenuePoint } from '@/hooks/useAnalyticsData';

type View = 'trend' | 'cumulative';

const RevenueChart: React.FC<{ data: MonthlyRevenuePoint[] }> = ({ data }) => {
  const [view, setView] = useState<View>('trend');
  const hasData = data.some((d) => d.revenue > 0);

  const chartData = useMemo(() => {
    // 3-month moving average
    let cum = 0;
    return data.map((d, i) => {
      cum += d.revenue;
      const window = data.slice(Math.max(0, i - 2), i + 1);
      const ma = window.reduce((s, p) => s + p.revenue, 0) / window.length;
      return { ...d, ma, cumulative: cum };
    });
  }, [data]);

  return (
    <div className="rounded-lg border border-gold/20 bg-darker p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-gold">Monthly Revenue</h3>
          <p className="text-[11px] text-muted-foreground">Bars = revenue · Line = 3-mo moving avg</p>
        </div>
        <div className="flex gap-1 rounded-md border border-gold/20 p-1">
          {(['trend', 'cumulative'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${
                view === m ? 'bg-gold text-dark' : 'text-gold/70 hover:text-gold'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {!hasData ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No revenue recorded yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(45 90% 60%)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(45 90% 60%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 30% 60% / 0.15)" vertical={false} />
            <XAxis dataKey="label" stroke="hsl(45 30% 80%)" fontSize={11} tickMargin={6} />
            <YAxis
              stroke="hsl(45 30% 80%)"
              fontSize={11}
              width={62}
              tickFormatter={(v) => v >= 1000 ? `AED ${(v/1000).toFixed(1)}k` : `AED ${v}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(45 60% 50% / 0.06)' }}
              contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(45 60% 50% / 0.4)', borderRadius: 8, color: 'hsl(45 90% 80%)', fontSize: 12 }}
              formatter={(v: number, name) => {
                if (name === 'revenue') return [`AED ${v.toFixed(2)}`, 'Revenue'];
                if (name === 'cumulative') return [`AED ${v.toFixed(2)}`, 'Cumulative'];
                if (name === 'ma') return [`AED ${v.toFixed(2)}`, '3-mo Avg'];
                return [v, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="circle" />
            {view === 'trend' ? (
              <>
                <Bar dataKey="revenue" name="Revenue" fill="hsl(45 90% 60%)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="ma" name="3-mo Avg" stroke="hsl(150 70% 60%)" strokeWidth={2} dot={false} />
              </>
            ) : (
              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="hsl(45 90% 60%)" strokeWidth={2.5} fill="url(#revFill)" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
