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

  // Use the custom uploaded image for the first perfume (Signature First)
  const perfumeImage = name === "Signature First" 
    ? "/lovable-uploads/a9ced43b-497b-4733-9093-613c3f990036.png" 
    : image;

  return (
    <div 
      className={cn(
        "group flex flex-col md:flex-row gap-8 items-center",
        invert && "md:flex-row-reverse"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-full md:w-1/2 overflow-hidden">
        <div className="relative h-[400px] overflow-hidden">
          <ProductImage 
            src={perfumeImage} 
            alt={name}
            fullWidth={true}
          />
        </div>
      </div>
      
      <div className="w-full md:w-1/2 space-y-4 text-left md:text-center">
        <div className="mb-2">
          <h3 className="text-sm uppercase tracking-widest text-gold">{notes}</h3>
          <h2 className="text-3xl md:text-4xl font-serif">{name}</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-md">
          {description}
        </p>
        <p className="text-xl font-light text-gold mt-4">
          {price.replace('$', 'AED ')}
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
