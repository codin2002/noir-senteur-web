
import React from 'react';
import ResponsiveImage from './ResponsiveImage';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt,
  className
}) => {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <ResponsiveImage 
        src={src} 
        alt={alt} 
        aspectRatio={3/4}
        objectFit="contain"
      />
    </div>
  );
};

export default ProductImage;
