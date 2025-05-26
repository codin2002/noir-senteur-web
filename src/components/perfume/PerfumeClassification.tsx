
import React, { useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ClassificationTabs from './classification/ClassificationTabs';
import { PerfumeClassificationData } from './classification/ClassificationData';

interface PerfumeClassificationProps {
  classificationData: PerfumeClassificationData | null;
  isLoading: boolean;
}

const PerfumeClassification: React.FC<PerfumeClassificationProps> = ({ 
  classificationData,
  isLoading 
}) => {
  const [activeTab, setActiveTab] = useState("type");
  
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

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
      <h3 className="text-xl font-serif mb-2 text-white">Classification</h3>
      <p className="text-white/60 text-sm mb-6">Fragrance Profile Analysis</p>
      
      <ClassificationTabs 
        classificationData={classificationData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default PerfumeClassification;
