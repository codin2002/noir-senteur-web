
import React from 'react';
import { Perfume } from '@/types/perfume';
import ProductImage from '../common/ProductImage';
import { PRICING, getPerfumeImage, getPerfumeDisplayName } from '@/utils/constants';

interface OrderItemProps {
  id: string;
  perfume: Perfume;
  price: number;
  quantity: number;
}

const OrderItem: React.FC<OrderItemProps> = ({ id, perfume, price, quantity }) => {
  return (
    <div key={id} className="flex items-center gap-4">
      <div className="w-16 h-16 rounded overflow-hidden">
        <ProductImage 
          src={getPerfumeImage(perfume)} 
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
