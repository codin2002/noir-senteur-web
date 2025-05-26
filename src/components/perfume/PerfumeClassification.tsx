
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useIsMobile } from '@/hooks/use-mobile';

interface PerfumeClassificationProps {
  classificationData: {
    id: string;
    perfume_id: string;
    type_floral: number;
    type_fresh: number;
    type_oriental: number;
    type_woody: number;
    occasion_casual: number;
    occasion_formal: number;
    occasion_evening: number;
    occasion_special: number;
    season_spring: number;
    season_summer: number;
    season_fall: number;
    season_winter: number;
    audience_feminine: number;
    audience_masculine: number;
    audience_unisex: number;
  } | null;
  isLoading: boolean;
}

const PerfumeClassification: React.FC<PerfumeClassificationProps> = ({ 
  classificationData,
  isLoading 
}) => {
  const [activeTab, setActiveTab] = useState("type");
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!classificationData) {
    return (
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
        <h3 className="text-xl font-serif mb-4 text-white">Classification</h3>
        <div className="text-center py-8">
          <p className="text-white/70">No classification data available for this perfume.</p>
        </div>
      </div>
    );
  }

  const typeData = [
    { name: 'Floral', value: classificationData.type_floral, fullMark: 100 },
    { name: 'Fresh', value: classificationData.type_fresh, fullMark: 100 },
    { name: 'Oriental', value: classificationData.type_oriental, fullMark: 100 },
    { name: 'Woody', value: classificationData.type_woody, fullMark: 100 },
  ];

  const occasionData = [
    { name: 'Casual', value: classificationData.occasion_casual, fullMark: 100 },
    { name: 'Formal', value: classificationData.occasion_formal, fullMark: 100 },
    { name: 'Evening', value: classificationData.occasion_evening, fullMark: 100 },
    { name: 'Special', value: classificationData.occasion_special, fullMark: 100 },
  ];

  const seasonData = [
    { name: 'Spring', value: classificationData.season_spring, fullMark: 100 },
    { name: 'Summer', value: classificationData.season_summer, fullMark: 100 },
    { name: 'Fall', value: classificationData.season_fall, fullMark: 100 },
    { name: 'Winter', value: classificationData.season_winter, fullMark: 100 },
  ];

  const audienceData = [
    { name: 'Feminine', value: classificationData.audience_feminine, fullMark: 100 },
    { name: 'Masculine', value: classificationData.audience_masculine, fullMark: 100 },
    { name: 'Unisex', value: classificationData.audience_unisex, fullMark: 100 },
  ];

  const chartConfig = {
    classification: {
      label: "Classification",
      color: "#d4af37"
    }
  };

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

  const renderRadarChart = (data: any[]) => (
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

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
      <h3 className="text-xl font-serif mb-2 text-white">Classification</h3>
      <p className="text-white/60 text-sm mb-6">Fragrance Profile Analysis</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-black/30 border border-gold/20 mb-6 h-12">
          <TabsTrigger 
            value="type"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-white/70 text-sm font-medium"
          >
            Type
          </TabsTrigger>
          <TabsTrigger 
            value="occasion"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-white/70 text-sm font-medium"
          >
            Occasion
          </TabsTrigger>
          <TabsTrigger 
            value="season"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-white/70 text-sm font-medium"
          >
            Season
          </TabsTrigger>
          <TabsTrigger 
            value="audience"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-white/70 text-sm font-medium"
          >
            Audience
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="type" className="border-none p-0 mt-0">
          {renderRadarChart(typeData)}
        </TabsContent>

        <TabsContent value="occasion" className="border-none p-0 mt-0">
          {renderRadarChart(occasionData)}
        </TabsContent>

        <TabsContent value="season" className="border-none p-0 mt-0">
          {renderRadarChart(seasonData)}
        </TabsContent>

        <TabsContent value="audience" className="border-none p-0 mt-0">
          {renderRadarChart(audienceData)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerfumeClassification;
