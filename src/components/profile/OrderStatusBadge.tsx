
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
      case 'preorder':
        return 'text-purple-700 bg-purple-100';
      case 'awaiting_release':
        return 'text-amber-700 bg-amber-100';
      case 'ready_to_ship':
        return 'text-teal-700 bg-teal-100';
      case 'dispatched':
        return 'text-orange-600 bg-orange-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-pink-700 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const label = status.toLowerCase() === 'preorder' ? 'Preorder Confirmed'
    : status.toLowerCase() === 'awaiting_release' ? 'Awaiting Release'
    : status.toLowerCase() === 'ready_to_ship' ? 'Ready to Ship'
    : status;

  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={`${getStatusColor(status)} font-medium capitalize`}
    >
      {label}
    </Badge>
  );
};

export default OrderStatusBadge;
