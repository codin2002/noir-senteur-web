
import React from 'react';
import { Perfume } from '@/types/perfume';
import ProductImage from '../common/ProductImage';
import { PRICING, getPerfumeDisplayName } from '@/utils/constants';
import { usePerfumeImages } from '@/hooks/usePerfumeImages';

interface OrderItemProps {
  id: string;
  perfume: Perfume;
  price: number;
  quantity: number;
}

const OrderItem: React.FC<OrderItemProps> = ({ id, perfume, price, quantity }) => {
  const { primaryImage } = usePerfumeImages(perfume.id);

  return (
    <div key={id} className="flex items-center gap-4">
      <div className="w-16 h-16 rounded overflow-hidden">
        <ProductImage 
          src={primaryImage || perfume.image} 
          alt={perfume.name}
          className="w-full h-full"
          objectFit="contain"
        />
      </div>
      <div className="flex-grow">
        <h4 className="font-serif">{getPerfumeDisplayName(perfume)}</h4>
        <p className="text-sm text-muted-foreground">{perfume.notes}</p>
      </div>
      <div className="text-right">
        <p>{PRICING.CURRENCY_SYMBOL}{price} × {quantity}</p>
        <p className="text-gold">{PRICING.CURRENCY_SYMBOL}{(price * quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default OrderItem;
