import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { MonthlyRevenuePoint } from '@/hooks/useAnalyticsData';

const RevenueChart: React.FC<{ data: MonthlyRevenuePoint[] }> = ({ data }) => {
  const [view, setView] = useState<'area' | 'bar'>(data.length > 3 ? 'area' : 'bar');
  const hasData = data.some((d) => d.revenue > 0);

  return (
    <div className="rounded-lg border border-gold/20 bg-darker p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-xl text-gold">Monthly Revenue</h3>
        <div className="flex gap-1 rounded-md border border-gold/20 p-1">
          {(['bar', 'area'] as const).map((m) => (
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
          {view === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45 90% 60%)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="hsl(45 90% 60%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 30% 60% / 0.18)" />
              <XAxis dataKey="label" stroke="hsl(45 30% 80%)" fontSize={11} tickMargin={6} />
              <YAxis stroke="hsl(45 30% 80%)" fontSize={11} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
              <Tooltip
                contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(45 60% 50% / 0.4)', borderRadius: 8, color: 'hsl(45 90% 80%)' }}
                formatter={(v: number) => [`AED ${v.toFixed(2)}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(45 90% 60%)" strokeWidth={2.5} fill="url(#revFill)" />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 30% 60% / 0.18)" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(45 30% 80%)" fontSize={11} tickMargin={6} />
              <YAxis stroke="hsl(45 30% 80%)" fontSize={11} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
              <Tooltip
                cursor={{ fill: 'hsl(45 60% 50% / 0.08)' }}
                contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(45 60% 50% / 0.4)', borderRadius: 8, color: 'hsl(45 90% 80%)' }}
                formatter={(v: number) => [`AED ${v.toFixed(2)}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="hsl(45 90% 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
