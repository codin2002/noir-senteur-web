
import React from 'react';
import ResponsiveImage from './ResponsiveImage';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fullWidth?: boolean;
  fallbackImage?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt,
  className,
  fullWidth = false,
  fallbackImage = '/placeholder.svg'
}) => {
  // Check if image is from Supabase storage
  const isSupabaseStorage = src && (
    src.includes('supabase.co/storage/v1/object/public') || 
    src.includes('supabase.in/storage/v1/object/public')
  );

  // Determine the final image source
  const finalSrc = src || fallbackImage;

  // Handle image loading or error
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {(isLoading || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {isLoading && !hasError && (
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          )}
          {hasError && (
            <div className="flex flex-col items-center">
              <img src={fallbackImage} alt="Placeholder" className="w-12 h-12 opacity-50" />
              <p className="text-xs text-gray-500 mt-2">Image not available</p>
            </div>
          )}
        </div>
      )}
      <ResponsiveImage 
        src={finalSrc} 
        alt={alt} 
        aspectRatio={3/4}
        objectFit="contain"
        className={`${fullWidth ? "w-full h-full" : ""} ${hasError ? "opacity-0" : ""}`}
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
