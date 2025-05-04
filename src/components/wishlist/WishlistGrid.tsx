
import React from 'react';
import WishlistItem, { WishlistItemType } from './WishlistItem';

interface WishlistGridProps {
  items: WishlistItemType[];
  onAddToCart: (perfumeId: string) => void;
  onRemoveFromWishlist: (id: string) => void;
}

const WishlistGrid: React.FC<WishlistGridProps> = ({ 
  items, 
  onAddToCart, 
  onRemoveFromWishlist 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => (
        <WishlistItem 
          key={item.id} 
          item={item}
          onAddToCart={onAddToCart}
          onRemoveFromWishlist={onRemoveFromWishlist}
        />
      ))}
    </div>
  );
};

export default WishlistGrid;
