
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import CustomerInfoCell from './CustomerInfoCell';
import OrderActionsCell from './OrderActionsCell';
import ReturnInfoCell from './ReturnInfoCell';
import { getCustomerInfo, getDeliveryAddress, getStatusBadgeClasses } from '@/utils/orderUtils';

interface OrderItem {
  id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: {
    name: string;
    price: string;
  };
}

interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  delivery_address: string | null;
  notes: string | null;
  items: OrderItem[];
}

interface OrderTableRowProps {
  order: Order;
  onOrderUpdate: () => void;
}

const OrderTableRow: React.FC<OrderTableRowProps> = ({ order, onOrderUpdate }) => {
  const customer = getCustomerInfo(order);
  const deliveryAddress = getDeliveryAddress(order);

  return (
    <TableRow className="border-gold/10">
      <TableCell className="font-mono text-sm">
        {order.id.split('-')[0]}...
      </TableCell>
      
      <CustomerInfoCell customer={customer} />
      
      <TableCell>
        <div className="text-sm max-w-xs truncate" title={deliveryAddress}>
          {deliveryAddress}
        </div>
      </TableCell>
      
      <TableCell>
        {order.items.map((item, index) => (
          <div key={item.id} className="text-sm">
            {item.perfume.name} (×{item.quantity})
            {index < order.items.length - 1 && <br />}
          </div>
        ))}
      </TableCell>
      
      <TableCell className="font-semibold">
        AED {order.total}
      </TableCell>
      
      <TableCell>
        <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClasses(order.status)}`}>
          {order.status}
        </span>
      </TableCell>
      
      <TableCell className="text-sm text-gray-400">
        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
      </TableCell>
      
      <OrderActionsCell
        orderId={order.id}
        currentStatus={order.status}
        onOrderUpdate={onOrderUpdate}
      />
      
      <ReturnInfoCell order={order} />
    </TableRow>
  );
};

export default OrderTableRow;
