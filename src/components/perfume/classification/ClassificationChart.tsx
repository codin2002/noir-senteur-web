
import React from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClassificationDataItem } from './ClassificationData';

interface ClassificationChartProps {
  data: ClassificationDataItem[];
}

const ClassificationChart: React.FC<ClassificationChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  const chartHeight = isMobile ? 280 : 300;
  const chartOuterRadius = isMobile ? 80 : 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-700">
          {`${label}: ${payload[0].value}%`}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#141414] rounded-xl p-4 shadow-inner border border-neutral-800">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RadarChart cx="50%" cy="50%" outerRadius={chartOuterRadius} data={data}>
          <PolarGrid 
            stroke="#2e2e2e" 
            strokeWidth={1}
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ 
              fill: '#ccc', 
              fontSize: isMobile ? 12 : 13,
              fontWeight: 500
            }}
            className="text-gray-300"
          />
          <PolarRadiusAxis 
            domain={[0, 100]} 
            tick={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar 
            name="Fragrance Profile" 
            dataKey="value" 
            stroke="#ffffff" 
            fill="#ffffff" 
            fillOpacity={0.15}
            strokeWidth={1}
            dot={{ r: 3, fill: '#ffffff' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassificationChart;
