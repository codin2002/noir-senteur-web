
import React, { useState } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { Loader } from 'lucide-react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: number | "auto";
  className?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  hover?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showLoadingIndicator?: boolean;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  aspectRatio = 1,
  className,
  objectFit = "contain",
  hover = false,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg',
  showLoadingIndicator = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Function to handle image load
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };
  
  // Function to handle image error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };
  
  // If aspectRatio is "auto", render without AspectRatio wrapper to prevent cropping
  if (aspectRatio === "auto") {
    return (
      <div className={cn("relative w-full h-full", className)}>
        {isLoading && showLoadingIndicator && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/20 dark:bg-gray-800/20 z-10">
            <Loader className="w-6 h-6 text-gold animate-spin" />
          </div>
        )}
        
        <img 
          src={hasError ? fallbackSrc : src} 
          alt={alt} 
          className={cn(
            `w-auto h-auto max-w-full max-h-full m-auto object-${objectFit} transition-opacity duration-300`,
            hover && "transition-transform duration-500 hover:scale-105",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }
  
  // Default render with AspectRatio
  return (
    <AspectRatio ratio={aspectRatio as number} className={cn("relative overflow-hidden", className)}>
      {isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/20 dark:bg-gray-800/20 z-10">
          <Loader className="w-6 h-6 text-gold animate-spin" />
        </div>
      )}
      
      <img 
        src={hasError ? fallbackSrc : src} 
        alt={alt} 
        className={cn(
          `w-full h-full object-${objectFit} transition-opacity duration-300`,
          hover && "transition-transform duration-500 hover:scale-105",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </AspectRatio>
  );
};

export default ResponsiveImage;
