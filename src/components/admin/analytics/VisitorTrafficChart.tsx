import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface VisitorPoint {
  date: string;
  label: string;
  visitors: number;
}

const VisitorTrafficChart: React.FC<{ data: VisitorPoint[] }> = ({ data }) => {
  const hasData = data.some((point) => point.visitors > 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <div className="mb-4">
        <h3 className="font-serif text-xl text-gray-900">Website Visitors</h3>
        <p className="text-[11px] text-muted-foreground">
          Daily unique browsers over the last 30 days
        </p>
      </div>
      {!hasData ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Visitor activity will appear here as visits are recorded
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a24c" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#d4a24c" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickMargin={8} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={11} width={36} />
            <Tooltip
              cursor={{ stroke: '#d4a24c', strokeDasharray: '3 3' }}
              contentStyle={{ background: '#111827', border: '1px solid #d4a24c', borderRadius: 8, color: '#fff', fontSize: 12 }}
              formatter={(value: number) => [value, 'Visitors']}
            />
            <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#b7791f" strokeWidth={2.5} fill="url(#visitorFill)" activeDot={{ r: 5, fill: '#b7791f' }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default VisitorTrafficChart;
