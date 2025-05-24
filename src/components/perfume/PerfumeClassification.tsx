
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
  
  // Debug logging
  useEffect(() => {
    console.log('PerfumeClassification component rendered with data:', classificationData);
    console.log('Is loading:', isLoading);
  }, [classificationData, isLoading]);
  
  // For platforms that have issue with chart rendering, we'll use useEffect to handle initial render
  useEffect(() => {
    // This empty effect helps with chart rendering on some mobile platforms
    return () => {
      // Cleanup if needed
    };
  }, []);

  if (isLoading) {
    console.log('PerfumeClassification: Showing loading spinner');
    return <LoadingSpinner />;
  }

  if (!classificationData) {
    console.log('PerfumeClassification: No classification data available');
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No classification data available for this perfume.</p>
      </div>
    );
  }

  console.log('PerfumeClassification: Creating chart data from:', classificationData);

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

  console.log('Chart data created:', { typeData, occasionData, seasonData, audienceData });

  const chartConfig = {
    classification: {
      label: "Classification",
      color: "#d4af37"
    }
  };

  // Adjust chart size based on device
  const chartHeight = isMobile ? 250 : 350;
  const chartOuterRadius = isMobile ? 70 : 90;

  console.log('PerfumeClassification: Rendering charts with height:', chartHeight, 'radius:', chartOuterRadius);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-serif mb-4">Perfume Classification</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-darker border border-gold/20 mb-6 overflow-x-auto">
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
          <div className="bg-red-500/10 border border-red-500/20 p-4 mb-4 rounded">
            <p className="text-sm text-red-400">Debug: Type chart rendering with data: {JSON.stringify(typeData)}</p>
          </div>
          <ChartContainer config={chartConfig} className={`h-[${chartHeight}px]`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={chartOuterRadius} data={typeData}>
                <PolarGrid stroke="#5b5b5b" />
                <PolarAngleAxis dataKey="name" stroke="#d4d4d4" />
                <PolarRadiusAxis domain={[0, 100]} stroke="#5b5b5b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#222", borderColor: "#d4af37" }}
                  labelStyle={{ color: "#d4af37" }}
                />
                <Radar 
                  name="Classification" 
                  dataKey="value" 
                  stroke="#d4af37" 
                  fill="#d4af37" 
                  fillOpacity={0.3} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="occasion" className="border-none p-0">
          <div className="bg-red-500/10 border border-red-500/20 p-4 mb-4 rounded">
            <p className="text-sm text-red-400">Debug: Occasion chart rendering with data: {JSON.stringify(occasionData)}</p>
          </div>
          <ChartContainer config={chartConfig} className={`h-[${chartHeight}px]`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={chartOuterRadius} data={occasionData}>
                <PolarGrid stroke="#5b5b5b" />
                <PolarAngleAxis dataKey="name" stroke="#d4d4d4" />
                <PolarRadiusAxis domain={[0, 100]} stroke="#5b5b5b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#222", borderColor: "#d4af37" }}
                  labelStyle={{ color: "#d4af37" }}
                />
                <Radar 
                  name="Classification" 
                  dataKey="value" 
                  stroke="#d4af37" 
                  fill="#d4af37" 
                  fillOpacity={0.3} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="season" className="border-none p-0">
          <div className="bg-red-500/10 border border-red-500/20 p-4 mb-4 rounded">
            <p className="text-sm text-red-400">Debug: Season chart rendering with data: {JSON.stringify(seasonData)}</p>
          </div>
          <ChartContainer config={chartConfig} className={`h-[${chartHeight}px]`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={chartOuterRadius} data={seasonData}>
                <PolarGrid stroke="#5b5b5b" />
                <PolarAngleAxis dataKey="name" stroke="#d4d4d4" />
                <PolarRadiusAxis domain={[0, 100]} stroke="#5b5b5b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#222", borderColor: "#d4af37" }}
                  labelStyle={{ color: "#d4af37" }}
                />
                <Radar 
                  name="Classification" 
                  dataKey="value" 
                  stroke="#d4af37" 
                  fill="#d4af37" 
                  fillOpacity={0.3} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="audience" className="border-none p-0">
          <div className="bg-red-500/10 border border-red-500/20 p-4 mb-4 rounded">
            <p className="text-sm text-red-400">Debug: Audience chart rendering with data: {JSON.stringify(audienceData)}</p>
          </div>
          <ChartContainer config={chartConfig} className={`h-[${chartHeight}px]`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={chartOuterRadius} data={audienceData}>
                <PolarGrid stroke="#5b5b5b" />
                <PolarAngleAxis dataKey="name" stroke="#d4d4d4" />
                <PolarRadiusAxis domain={[0, 100]} stroke="#5b5b5b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#222", borderColor: "#d4af37" }}
                  labelStyle={{ color: "#d4af37" }}
                />
                <Radar 
                  name="Classification" 
                  dataKey="value" 
                  stroke="#d4af37" 
                  fill="#d4af37" 
                  fillOpacity={0.3} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerfumeClassification;
