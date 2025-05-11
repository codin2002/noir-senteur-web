
import React from 'react';
import ResponsiveImage from './ResponsiveImage';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fullWidth?: boolean;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt,
  className,
  fullWidth = false
}) => {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <ResponsiveImage 
        src={src} 
        alt={alt} 
        aspectRatio={3/4}
        objectFit="contain"
        className={fullWidth ? "w-full h-full" : ""}
      />
    </div>
  );
};

export default ProductImage;
