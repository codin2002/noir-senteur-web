import React from 'react';
import { Perfume } from '@/types/perfume';
import ProductImage from '../common/ProductImage';

interface OrderItemProps {
  id: string;
  perfume: Perfume;
  price: number;
  quantity: number;
}

const OrderItem: React.FC<OrderItemProps> = ({ id, perfume, price, quantity }) => {
  // Get the appropriate image source
  const getPerfumeImage = () => {
    // For the "Signature First" perfume, use the custom image with Arabic "313"
    if (perfume.name === "Signature First") {
      return "/lovable-uploads/a9ced43b-497b-4733-9093-613c3f990036.png";
    }
    
    // For "Luxury Collection" perfume, use the uploaded image
    if (perfume.name === "Luxury Collection") {
      return "/lovable-uploads/8409f135-32ac-4937-ae90-9d2ad51131b5.png";
    }
    
    // Otherwise use the image from the database
    return perfume.image;
  };

  return (
    <div key={id} className="flex items-center gap-4">
      <div className="w-16 h-16 rounded overflow-hidden">
        <ProductImage 
          src={getPerfumeImage()} 
          alt={perfume.name}
          className="w-full h-full"
          objectFit="contain"
        />
      </div>
      <div className="flex-grow">
        <h4 className="font-serif">{perfume.name}</h4>
        <p className="text-sm text-muted-foreground">{perfume.notes}</p>
      </div>
      <div className="text-right">
        <p>AED {price} × {quantity}</p>
        <p className="text-gold">AED {(price * quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default OrderItem;
