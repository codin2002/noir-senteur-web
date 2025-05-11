
import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import ProductImage from './common/ProductImage';
import { PRICING, getPerfumeImage, getPerfumeDisplayName } from '@/utils/constants';

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

  return (
    <div 
      className={cn(
        "group flex flex-col md:flex-row gap-8 items-center",
        invert && "md:flex-row-reverse"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-full md:w-1/2 overflow-hidden">
        <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
          <ProductImage 
            src={getPerfumeImage({name, image})} 
            alt={name}
            fullWidth={true}
            hover={true}
            aspectRatio="auto"
            objectFit="contain"
            className="max-h-full p-4" // Added padding to ensure image has space around it
          />
        </div>
      </div>
      
      <div className="w-full md:w-1/2 space-y-4 text-left md:text-center">
        <div className="mb-2">
          <h3 className="text-sm uppercase tracking-widest text-gold">{notes}</h3>
          <h2 className="text-3xl md:text-4xl font-serif">{getPerfumeDisplayName({name})}</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          {description}
        </p>
        <p className="text-xl font-light text-gold mt-4">
          {PRICING.CURRENCY_SYMBOL}{PRICING.PERFUME_PRICE}
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
