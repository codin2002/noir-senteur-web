
import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface PerfumeImageSliderProps {
  images: string[];
  alt: string;
  className?: string;
}

const PerfumeImageSlider: React.FC<PerfumeImageSliderProps> = ({ 
  images, 
  alt, 
  className 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 1) {
    return (
      <div className={cn("flex items-center justify-center h-[500px] lg:h-[700px] p-4", className)}>
        <img 
          src={images[0]} 
          alt={alt} 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="flex items-center justify-center h-[500px] lg:h-[700px] p-4">
                <img 
                  src={image} 
                  alt={`${alt} - Image ${index + 1}`} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
      
      {/* Thumbnail indicators */}
      {images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-16 h-16 border-2 rounded-md overflow-hidden",
                currentIndex === index ? "border-gold" : "border-gold/30"
              )}
            >
              <img 
                src={image} 
                alt={`${alt} thumbnail ${index + 1}`}
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
