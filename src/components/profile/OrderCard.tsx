
import React from 'react';
import OrderItem from './OrderItem';
import { Perfume } from '@/types/perfume';

interface OrderItemType {
  id: string;
  order_id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: Perfume;
}

interface OrderCardProps {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItemType[];
  formatDate: (dateString: string) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  id, 
  createdAt, 
  status, 
  total, 
  items,
  formatDate
}) => {
  return (
    <div className="bg-darker border border-gold/20 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gold/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Order #{id.substring(0, 8)}</p>
            <p className="text-sm text-muted-foreground">Placed on {formatDate(createdAt)}</p>
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
              {status}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-gold text-lg">Total: AED {total}</p>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium mb-3">Items</h3>
        <div className="space-y-4">
          {items.map(item => (
            <OrderItem
              key={item.id}
              id={item.id}
              perfume={item.perfume}
              price={item.price}
              quantity={item.quantity}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
