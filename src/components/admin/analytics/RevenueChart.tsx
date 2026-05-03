import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { MonthlyRevenuePoint } from '@/hooks/useAnalyticsData';

const RevenueChart: React.FC<{ data: MonthlyRevenuePoint[] }> = ({ data }) => {
  return (
    <div className="rounded-lg border border-gold/20 bg-dark/50 p-5">
      <h3 className="mb-4 font-serif text-xl text-gold">Monthly Revenue</h3>
      {data.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No revenue data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gold) / 0.1)" />
            <XAxis dataKey="label" stroke="hsl(var(--gold) / 0.6)" fontSize={12} />
            <YAxis stroke="hsl(var(--gold) / 0.6)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--gold) / 0.3)',
                borderRadius: 8,
              }}
              formatter={(v: number, name) => [
                name === 'revenue' ? `AED ${v.toFixed(2)}` : v,
                name === 'revenue' ? 'Revenue' : name,
              ]}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--gold))" strokeWidth={2} fill="url(#revFill)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
