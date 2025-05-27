
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassificationChart from './ClassificationChart';
import { 
  transformTypeData, 
  transformOccasionData, 
  transformSeasonData, 
  transformAudienceData
} from './ClassificationData';
import { PerfumeClassificationData } from '@/types/perfumeDetail';

interface ClassificationTabsProps {
  classificationData: PerfumeClassificationData;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ClassificationTabs: React.FC<ClassificationTabsProps> = ({ 
  classificationData, 
  activeTab, 
  onTabChange 
}) => {
  const typeData = transformTypeData(classificationData);
  const occasionData = transformOccasionData(classificationData);
  const seasonData = transformSeasonData(classificationData);
  const audienceData = transformAudienceData(classificationData);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
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
        <ClassificationChart data={typeData} />
      </TabsContent>

      <TabsContent value="occasion" className="border-none p-0 mt-0">
        <ClassificationChart data={occasionData} />
      </TabsContent>

      <TabsContent value="season" className="border-none p-0 mt-0">
        <ClassificationChart data={seasonData} />
      </TabsContent>

      <TabsContent value="audience" className="border-none p-0 mt-0">
        <ClassificationChart data={audienceData} />
      </TabsContent>
    </Tabs>
  );
};

export default ClassificationTabs;
