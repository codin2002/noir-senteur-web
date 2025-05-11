
import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Perfume } from '@/types/perfume';
import ResponsiveImage from '@/components/common/ResponsiveImage';
import { PRICING, getPerfumeImage, getPerfumeDisplayName } from '@/utils/constants';

export interface WishlistItemType {
  id: string;
  user_id: string;
  perfume_id: string;
  created_at: string;
  perfume: Perfume;
}

interface WishlistItemProps {
  item: WishlistItemType;
  onAddToCart: (perfumeId: string) => void;
  onRemoveFromWishlist: (id: string) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ 
  item, 
  onAddToCart, 
  onRemoveFromWishlist 
}) => {
  return (
    <div className="bg-darker border border-gold/20 rounded-lg overflow-hidden">
      <div className="h-[240px] flex items-center justify-center p-4">
        <ResponsiveImage 
          src={getPerfumeImage(item.perfume)}
          alt={item.perfume.name}
          aspectRatio="auto"
          hover={true}
          objectFit="contain"
          className="max-h-full"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm uppercase tracking-widest text-gold">{item.perfume.notes}</h3>
        <h2 className="text-xl font-serif mb-2">{getPerfumeDisplayName(item.perfume)}</h2>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {item.perfume.description}
        </p>
        <p className="text-lg font-light text-gold mb-4">{PRICING.CURRENCY_SYMBOL}{PRICING.PERFUME_PRICE}</p>
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-gold text-darker hover:bg-gold/80"
            onClick={() => onAddToCart(item.perfume.id)}
          >
            Add to Cart
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="border-red-500/50 hover:bg-red-500/10"
            onClick={() => onRemoveFromWishlist(item.id)}
          >
            <Trash className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
