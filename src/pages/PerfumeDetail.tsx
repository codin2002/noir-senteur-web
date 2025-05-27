
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PerfumeDetailContent from '@/components/perfume/PerfumeDetailContent';
import { usePerfumeDetail } from '@/hooks/usePerfumeDetail';

const PerfumeDetail = () => {
  const navigate = useNavigate();
  const {
    perfume,
    perfumeImages,
    loading,
    isInWishlist,
    setIsInWishlist,
    classificationData,
    ratingsData,
    isLoadingClassification,
    isLoadingRatings,
    refreshAnalytics
  } = usePerfumeDetail();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-6 flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif mb-4">Perfume Not Found</h1>
            <Button onClick={() => navigate('/')} className="bg-gold text-darker hover:bg-gold/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mb-6 text-gold hover:text-gold/80 hover:bg-gold/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collection
        </Button>

        <PerfumeDetailContent
          perfume={perfume}
          perfumeImages={perfumeImages}
          isInWishlist={isInWishlist}
          setIsInWishlist={setIsInWishlist}
          classificationData={classificationData}
          ratingsData={ratingsData}
          isLoadingClassification={isLoadingClassification}
          isLoadingRatings={isLoadingRatings}
          refreshAnalytics={refreshAnalytics}
        />
      </div>
      <Footer />
    </div>
  );
};

export default PerfumeDetail;
