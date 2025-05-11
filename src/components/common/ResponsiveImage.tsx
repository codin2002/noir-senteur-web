
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: number;
  className?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  hover?: boolean;
  onLoad?: () => void;
  onError?: () => void;
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
}) => {
  return (
    <AspectRatio ratio={aspectRatio} className="overflow-hidden">
      <img 
        src={src} 
        alt={alt} 
        className={cn(
          `w-full h-full object-${objectFit}`,
          hover && "transition-transform duration-500 hover:scale-105",
          className
        )}
        loading="lazy"
        onLoad={onLoad}
        onError={onError}
      />
    </AspectRatio>
  );
};

export default ResponsiveImage;
