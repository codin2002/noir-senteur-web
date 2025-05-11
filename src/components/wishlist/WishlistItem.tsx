
import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Perfume } from '@/types/perfume';
import ResponsiveImage from '@/components/common/ResponsiveImage';

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
  // Check if this is the first signature perfume to use the custom image
  const perfumeImage = item.perfume.name === "Signature First" 
    ? "/lovable-uploads/a9ced43b-497b-4733-9093-613c3f990036.png" 
    : item.perfume.image;

  // Display Arabic "313" for Signature First perfume
  const displayName = item.perfume.name === "Signature First" ? "٣١٣" : item.perfume.name;

  return (
    <div className="bg-darker border border-gold/20 rounded-lg overflow-hidden">
      <div className="h-[240px] relative overflow-hidden">
        <ResponsiveImage 
          src={perfumeImage}
          alt={item.perfume.name}
          aspectRatio={16/10}
          hover={true}
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm uppercase tracking-widest text-gold">{item.perfume.notes}</h3>
        <h2 className="text-xl font-serif mb-2">{displayName}</h2>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {item.perfume.description}
        </p>
        <p className="text-lg font-light text-gold mb-4">{item.perfume.price}</p>
        
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
