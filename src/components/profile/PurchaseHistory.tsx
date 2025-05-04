
import React from 'react';
import OrderCard from './OrderCard';
import EmptyPurchaseHistory from './EmptyPurchaseHistory';
import { Perfume } from '@/types/perfume';

interface OrderItemType {
  id: string;
  order_id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: Perfume;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: OrderItemType[];
}

interface PurchaseHistoryProps {
  orders: Order[];
  formatDate: (dateString: string) => string;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ orders, formatDate }) => {
  if (orders.length === 0) {
    return <EmptyPurchaseHistory />;
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          id={order.id}
          createdAt={order.created_at}
          status={order.status}
          total={order.total}
          items={order.items}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default PurchaseHistory;
