
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  status: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'default';
      case 'dispatched':
        return 'secondary';
      case 'delivered':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'dispatched':
        return 'text-orange-600 bg-orange-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={`${getStatusColor(status)} font-medium capitalize`}
    >
      {status}
    </Badge>
  );
};

export default OrderStatusBadge;
