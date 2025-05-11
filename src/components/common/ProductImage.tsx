
import React, { useState } from 'react';
import ResponsiveImage from './ResponsiveImage';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fullWidth?: boolean;
  fallbackImage?: string;
  aspectRatio?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  showPlaceholderOnError?: boolean;
  hover?: boolean;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt,
  className,
  fullWidth = false,
  fallbackImage = '/placeholder.svg',
  aspectRatio = 3/4,
  objectFit = "contain",
  showPlaceholderOnError = true,
  hover = false
}) => {
  // Check if image is from Supabase storage or other common cloud providers
  const isSupabaseStorage = src && (
    src.includes('supabase.co/storage/v1/object/public') || 
    src.includes('supabase.in/storage/v1/object/public')
  );
  
  const isCloudImage = src && (
    isSupabaseStorage || 
    src.includes('cloudinary.com') ||
    src.includes('unsplash.com') ||
    src.includes('amazonaws.com')
  );

  // For special image formats
  const isWebpOrAvif = src && (
    src.toLowerCase().endsWith('.webp') || 
    src.toLowerCase().endsWith('.avif') ||
    src.includes('.webp') ||
    src.includes('.avif')
  );

  // Determine the final image source
  const finalSrc = src || fallbackImage;

  // Handle image loading or error
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Calculate optimal container classes based on image type
  const containerClasses = cn(
    "relative overflow-hidden rounded-lg",
    isWebpOrAvif && "bg-darker", // Better background for modern formats
    fullWidth ? "w-full h-full" : "",
    className
  );

  return (
    <div className={containerClasses}>
      {showPlaceholderOnError && hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
          <img src={fallbackImage} alt="Placeholder" className="w-12 h-12 opacity-50" />
          <p className="text-xs text-gray-500 mt-2">Image not available</p>
        </div>
      )}

      <ResponsiveImage 
        src={finalSrc} 
        alt={alt} 
        aspectRatio={aspectRatio}
        objectFit={objectFit}
        hover={hover}
        className={cn(
          fullWidth ? "w-full h-full" : "",
          hasError && !showPlaceholderOnError ? "opacity-0" : ""
        )}
        fallbackSrc={fallbackImage}
        showLoadingIndicator={true}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

export default ProductImage;
