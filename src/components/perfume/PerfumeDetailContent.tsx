
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import PerfumeImageSlider from '@/components/perfume/PerfumeImageSlider';
import PerfumeClassification from '@/components/perfume/PerfumeClassification';
import PerfumeRatings from '@/components/perfume/PerfumeRatings';
import PerfumeInfo from '@/components/perfume/PerfumeInfo';
import PerfumeActions from '@/components/perfume/PerfumeActions';

interface PerfumeImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

interface PerfumeClassificationData {
  id: string;
  perfume_id: string;
  type_floral: number;
  type_fresh: number;
  type_oriental: number;
  type_woody: number;
  audience_masculine: number;
  audience_feminine: number;
  audience_unisex: number;
  occasion_casual: number;
  occasion_formal: number;
  occasion_evening: number;
  occasion_special: number;
  season_spring: number;
  season_summer: number;
  season_fall: number;
  season_winter: number;
}

interface PerfumeRatingData {
  id: string;
  perfume_id: string;
  scent_rating: number;
  durability_rating: number;
  sillage_rating: number;
  bottle_rating: number;
  total_votes: number;
}

interface Perfume {
  id: string;
  name: string;
  description: string;
  price: string;
  price_value: number;
  image: string;
  notes: string;
}

interface PerfumeDetailContentProps {
  perfume: Perfume;
  perfumeImages: PerfumeImage[];
  isInWishlist: boolean;
  setIsInWishlist: (value: boolean) => void;
  classificationData: PerfumeClassificationData | null;
  ratingsData: PerfumeRatingData | null;
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
  ratingsData,
  isLoadingClassification,
  isLoadingRatings,
  refreshAnalytics
}) => {
  console.log('PerfumeDetailContent - Classification Data:', classificationData);
  console.log('PerfumeDetailContent - Ratings Data:', ratingsData);
  console.log('PerfumeDetailContent - Loading states:', { isLoadingClassification, isLoadingRatings });

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
      
      {/* Classification & Ratings - Give more space and better layout */}
      <div className="mt-16 border-t border-gold/30 pt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif">Perfume Analytics</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
            className="border-gold/50 text-gold hover:bg-gold/10"
            disabled={isLoadingClassification || isLoadingRatings}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingClassification || isLoadingRatings ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        
        {/* Debug info to see what data we have */}
        <div className="mb-4 p-4 bg-black/20 rounded text-xs text-gold">
          <p>Debug Info:</p>
          <p>Classification Data: {classificationData ? 'Available' : 'Not Available'}</p>
          <p>Ratings Data: {ratingsData ? 'Available' : 'Not Available'}</p>
          <p>Loading Classification: {isLoadingClassification ? 'Yes' : 'No'}</p>
          <p>Loading Ratings: {isLoadingRatings ? 'Yes' : 'No'}</p>
        </div>
        
        {/* Single column layout for better space utilization */}
        <div className="space-y-12">
          <div className="w-full">
            <PerfumeClassification 
              classificationData={classificationData} 
              isLoading={isLoadingClassification}
            />
          </div>
          <div className="w-full">
            <PerfumeRatings 
              ratingsData={ratingsData} 
              isLoading={isLoadingRatings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeDetailContent;
