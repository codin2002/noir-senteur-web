import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { InventoryMovementPoint } from '@/hooks/useAnalyticsData';

const InventoryMovementChart: React.FC<{ data: InventoryMovementPoint[] }> = ({ data }) => {
  return (
    <div className="rounded-lg border border-gold/20 bg-dark/50 p-5">
      <h3 className="mb-4 font-serif text-xl text-gold">Inventory Movement</h3>
      {data.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No movement data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gold) / 0.1)" />
            <XAxis dataKey="label" stroke="hsl(var(--gold) / 0.6)" fontSize={12} />
            <YAxis stroke="hsl(var(--gold) / 0.6)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--gold) / 0.3)',
                borderRadius: 8,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="stockIn" name="Stock In" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="stockOut" name="Stock Out" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InventoryMovementChart;
