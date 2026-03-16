
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductImage from './common/ProductImage';
import { getPerfumeDisplayName, PRICING } from '@/utils/constants';
import { usePerfumeImages } from '@/hooks/usePerfumeImages';

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
  delay = 0,
}) => {
  const navigate = useNavigate();
  const { primaryImage } = usePerfumeImages(id);

  const handleExplore = () => {
    navigate(`/perfume/${id}`);
  };

  return (
    <div
      className="group flex flex-col cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={handleExplore}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary/30">
        <ProductImage
          src={primaryImage || image}
          alt={name}
          fullWidth={true}
          hover={true}
          aspectRatio={1}
          objectFit="contain"
          className="w-full h-full p-4"
        />
      </div>

      <div className="mt-4 space-y-1 text-center">
        <h3 className="text-xs uppercase tracking-widest text-accent">{notes}</h3>
        <h2 className="text-lg md:text-xl font-serif text-foreground">{getPerfumeDisplayName({ name })}</h2>
        <p className="text-sm text-accent font-light">
          {PRICING.CURRENCY_SYMBOL}{PRICING.PERFUME_PRICE}
        </p>
        <button className="btn-outline mt-3 text-[10px] py-2 px-4" onClick={(e) => { e.stopPropagation(); handleExplore(); }}>
          BUY
        </button>
      </div>
    </div>
  );
};

export default PerfumeCard;
