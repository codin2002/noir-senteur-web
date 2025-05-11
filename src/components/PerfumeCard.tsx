
import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import ProductImage from './common/ProductImage';

interface PerfumeCardProps {
  id: string; 
  name: string;
  notes: string;
  description: string;
  image: string;
  price: string;
  delay?: number;
  invert?: boolean;
}

const PerfumeCard: React.FC<PerfumeCardProps> = ({
  id,
  name,
  notes,
  description,
  image,
  price,
  delay = 0,
  invert = false
}) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate(`/perfume/${id}`);
  };

  // Get the appropriate image source
  const getPerfumeImage = () => {
    // For the "Signature First" perfume, use the local image
    if (name === "Signature First") {
      return "/lovable-uploads/a9ced43b-497b-4733-9093-613c3f990036.png";
    }
    
    // For "Luxury Collection" perfume, use the newly uploaded image
    if (name === "Luxury Collection") {
      return "/lovable-uploads/8409f135-32ac-4937-ae90-9d2ad51131b5.png";
    }
    
    // Otherwise use the image from the database
    return image;
  };

  // Display Arabic "313" for Signature First perfume
  const displayName = name === "Signature First" ? "٣١٣" : name;

  return (
    <div 
      className={cn(
        "group flex flex-col md:flex-row gap-8 items-center",
        invert && "md:flex-row-reverse"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-full md:w-1/2 overflow-hidden">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          <ProductImage 
            src={getPerfumeImage()} 
            alt={name}
            fullWidth={true}
            hover={true}
            aspectRatio={3/4}
            objectFit="contain"
          />
        </div>
      </div>
      
      <div className="w-full md:w-1/2 space-y-4 text-left md:text-center">
        <div className="mb-2">
          <h3 className="text-sm uppercase tracking-widest text-gold">{notes}</h3>
          <h2 className="text-3xl md:text-4xl font-serif">{displayName}</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          {description}
        </p>
        <p className="text-xl font-light text-gold mt-4">
          AED 100
        </p>
        <button 
          className="btn-outline mt-6" 
          onClick={handleExplore}
        >
          EXPLORE
        </button>
      </div>
    </div>
  );
};

export default PerfumeCard;
