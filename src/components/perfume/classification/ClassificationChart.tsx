
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
  
  const chartHeight = isMobile ? 280 : 400;
  const chartOuterRadius = isMobile ? 80 : 120;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-sm border border-gold/30 rounded-lg px-3 py-2">
          <p className="text-gold font-medium">{`${label}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RadarChart cx="50%" cy="50%" outerRadius={chartOuterRadius} data={data}>
          <PolarGrid 
            stroke="#333333" 
            strokeWidth={1}
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ 
              fill: '#ffffff', 
              fontSize: isMobile ? 12 : 14,
              fontWeight: 500
            }}
            className="text-white"
          />
          <PolarRadiusAxis 
            domain={[0, 100]} 
            tick={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar 
            name="Classification" 
            dataKey="value" 
            stroke="#d4af37" 
            fill="#d4af37" 
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ fill: '#d4af37', strokeWidth: 0, r: 4 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassificationChart;
