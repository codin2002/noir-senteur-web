
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClassificationDataItem } from './ClassificationData';

interface ClassificationChartProps {
  data: ClassificationDataItem[];
}

const ClassificationChart: React.FC<ClassificationChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  const chartHeight = isMobile ? 280 : 300;
  const pieRadius = isMobile ? 80 : 100;

  // Color palette for the pie chart segments
  const colors = ['#ffffff', '#cccccc', '#999999', '#666666'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-700">
          {`${payload[0].name}: ${payload[0].value}%`}
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for very small segments

    return (
      <text 
        x={x} 
        y={y} 
        fill="#ccc" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={isMobile ? 12 : 13}
        fontWeight={500}
      >
        {name}
      </text>
    );
  };

  return (
    <div className="bg-[#141414] rounded-xl p-4 shadow-inner border border-neutral-800">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={pieRadius}
            fill="#8884d8"
            dataKey="value"
            stroke="#2e2e2e"
            strokeWidth={1}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassificationChart;
