
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
  
  // More responsive chart dimensions
  const chartHeight = isMobile ? 240 : 300;
  const chartOuterRadius = isMobile ? 60 : 100;
  const fontSize = isMobile ? 10 : 13;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-700">
          {`${label}: ${payload[0].value}%`}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#141414] rounded-xl p-2 md:p-4 shadow-inner border border-neutral-800">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius={chartOuterRadius} 
          data={data}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <PolarGrid 
            stroke="#2e2e2e" 
            strokeWidth={1}
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ 
              fill: '#ccc', 
              fontSize: fontSize,
              fontWeight: 500
            }}
            className="text-gray-300"
            tickFormatter={(value) => isMobile && value.length > 8 ? `${value.substring(0, 6)}...` : value}
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
            strokeWidth={isMobile ? 1 : 2}
            dot={{ r: isMobile ? 2 : 3, fill: '#ffffff' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassificationChart;
