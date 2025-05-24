
import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface PerfumeImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

interface PerfumeImageSliderProps {
  images: PerfumeImage[];
  perfumeName: string;
  fallbackImage?: string;
  className?: string;
}

const PerfumeImageSlider: React.FC<PerfumeImageSliderProps> = ({ 
  images, 
  perfumeName,
  fallbackImage,
  className 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract image URLs from the PerfumeImage objects
  const imageUrls = images.map(img => img.image_url);
  
  // If no images, use fallback
  const displayImages = imageUrls.length > 0 ? imageUrls : (fallbackImage ? [fallbackImage] : []);

  if (displayImages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[500px] lg:h-[700px] p-4 bg-gray-100", className)}>
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  if (displayImages.length === 1) {
    return (
      <div className={cn("flex items-center justify-center h-[500px] lg:h-[700px] p-4", className)}>
        <img 
          src={displayImages[0]} 
          alt={perfumeName} 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Carousel className="w-full">
        <CarouselContent>
          {displayImages.map((imageUrl, index) => (
            <CarouselItem key={index}>
              <div className="flex items-center justify-center h-[500px] lg:h-[700px] p-4">
                <img 
                  src={imageUrl} 
                  alt={`${perfumeName} - Image ${index + 1}`} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {displayImages.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
      
      {/* Thumbnail indicators */}
      {displayImages.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {displayImages.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-16 h-16 border-2 rounded-md overflow-hidden",
                currentIndex === index ? "border-gold" : "border-gold/30"
              )}
            >
              <img 
                src={imageUrl} 
                alt={`${perfumeName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerfumeImageSlider;
