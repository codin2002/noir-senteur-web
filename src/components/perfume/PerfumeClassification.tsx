
import React, { useState } from 'react';
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!classificationData) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No classification data available for this perfume.</p>
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

  return (
    <div className="mt-8">
      <h3 className="text-xl font-serif mb-4">Perfume Classification</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-darker border border-gold/20 mb-6">
          <TabsTrigger 
            value="type"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
          >
            Type
          </TabsTrigger>
          <TabsTrigger 
            value="occasion"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
          >
            Occasion
          </TabsTrigger>
          <TabsTrigger 
            value="season"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
          >
            Season
          </TabsTrigger>
          <TabsTrigger 
            value="audience"
            className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
          >
            Audience
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="type" className="border-none p-0">
          <ChartContainer config={chartConfig} className="h-[350px]">
            <RadarChart outerRadius={90} width={730} height={350} data={typeData}>
              <PolarGrid stroke="#5b5b5b" />
              <PolarAngleAxis dataKey="name" stroke="#d4d4d4" />
              <PolarRadiusAxis domain={[0, 100]} stroke="#5b5b5b" />
              <Tooltip />
              <Radar 
                name="Classification" 
                dataKey="value" 
                stroke="#d4af37" 
                fill="#d4af37" 
                fillOpacity={0.3} 
              />
            </RadarChart>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="occasion" className="border-none p-0">
          <ChartContainer config={chartConfig} className="h-[350px]">
            <RadarChart outerRadius={90} width={730} height={350} data={occasionData}>
              <PolarGrid stroke="#5b5b5b" />
              <PolarAngleAxis dataKey="name" stroke="#d4d4d4" />
              <PolarRadiusAxis domain={[0, 100]} stroke="#5b5b5b" />
              <Tooltip />
              <Radar 
                name="Classification" 
                dataKey="value" 
                stroke="#d4af37" 
                fill="#d4af37" 
                fillOpacity={0.3} 
              />
            </RadarChart>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="season" className="border-none p-0">
          <ChartContainer config={chartConfig} className="h-[350px]">
            <RadarChart outerRadius={90} width={730} height={350} data={seasonData}>
              <PolarGrid stroke="#5b5b5b" />
              <PolarAngleAxis dataKey="name" stroke="#d4d4d4" />
              <PolarRadiusAxis domain={[0, 100]} stroke="#5b5b5b" />
              <Tooltip />
              <Radar 
                name="Classification" 
                dataKey="value" 
                stroke="#d4af37" 
                fill="#d4af37" 
                fillOpacity={0.3} 
              />
            </RadarChart>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="audience" className="border-none p-0">
          <ChartContainer config={chartConfig} className="h-[350px]">
            <RadarChart outerRadius={90} width={730} height={350} data={audienceData}>
              <PolarGrid stroke="#5b5b5b" />
              <PolarAngleAxis dataKey="name" stroke="#d4d4d4" />
              <PolarRadiusAxis domain={[0, 100]} stroke="#5b5b5b" />
              <Tooltip />
              <Radar 
                name="Classification" 
                dataKey="value" 
                stroke="#d4af37" 
                fill="#d4af37" 
                fillOpacity={0.3} 
              />
            </RadarChart>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerfumeClassification;
