
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import PerfumeImageSlider from '@/components/perfume/PerfumeImageSlider';
import PerfumeClassification from '@/components/perfume/PerfumeClassification';
import PerfumeInfo from '@/components/perfume/PerfumeInfo';
import PerfumeActions from '@/components/perfume/PerfumeActions';
import { PerfumeImage, PerfumeClassificationData, Perfume } from '@/types/perfumeDetail';

interface PerfumeDetailContentProps {
  perfume: Perfume;
  perfumeImages: PerfumeImage[];
  isInWishlist: boolean;
  setIsInWishlist: (value: boolean) => void;
  classificationData: PerfumeClassificationData | null;
  ratingsData: any;
  isLoadingClassification: boolean;
  isLoadingRatings: boolean;
  refreshAnalytics: () => void;
}

const PerfumeDetailContent: React.FC<PerfumeDetailContentProps> = ({
  perfume,
  perfumeImages,
  isInWishlist,
  setIsInWishlist,
  classificationData,
  isLoadingClassification,
  refreshAnalytics
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-6">
          <PerfumeImageSlider 
            images={perfumeImages} 
            perfumeName={perfume.name}
            fallbackImage={perfume.image}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <PerfumeInfo perfume={perfume} />
          <PerfumeActions 
            perfume={perfume}
            perfumeId={perfume.id}
            isInWishlist={isInWishlist}
            setIsInWishlist={setIsInWishlist}
          />
        </div>
      </div>
      
      {/* Classification Only */}
      <div className="mt-16 border-t border-gold/30 pt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif">Fragrance Profile</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
            className="border-gold/50 text-gold hover:bg-gold/10"
            disabled={isLoadingClassification}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingClassification ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        
        <div className="w-full">
          <PerfumeClassification 
            classificationData={classificationData} 
            isLoading={isLoadingClassification}
          />
        </div>
      </div>
    </div>
  );
};

export default PerfumeDetailContent;
