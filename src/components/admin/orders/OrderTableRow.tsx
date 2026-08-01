import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TableCell, TableRow } from '@/components/ui/table';
import CustomerInfoCell from './CustomerInfoCell';
import OrderActionsCell from './OrderActionsCell';
import ReturnInfoCell from './ReturnInfoCell';
import { AdminOrder } from '@/types/adminOrder';
import { getCustomerInfo, getDeliveryAddress, getOrderEmirate, getStatusBadgeClasses } from '@/utils/orderUtils';

interface OrderTableRowProps {
  order: AdminOrder;
  onOrderUpdate: () => void;
}

const OrderTableRow: React.FC<OrderTableRowProps> = ({ order, onOrderUpdate }) => {
  const customer = getCustomerInfo(order);
  const deliveryAddress = getDeliveryAddress(order);
  const emirate = getOrderEmirate(order);

  return (
    <TableRow className="border-stone-200">
      <TableCell className="font-mono text-sm text-stone-700">{order.id.split('-')[0]}…</TableCell>
      <CustomerInfoCell customer={customer} />
      <TableCell>
        <div className="text-sm font-medium text-stone-900">{emirate}</div>
        <div className="max-w-[180px] truncate text-xs text-stone-500" title={deliveryAddress}>{deliveryAddress}</div>
      </TableCell>
      <TableCell>
        {order.items.map((item) => (
          <div key={item.id} className="mb-1.5 whitespace-nowrap text-sm last:mb-0">
            <span className="font-medium text-stone-900">{item.perfume.name}</span>
            <span className="ml-1 text-stone-500">×{item.quantity}</span>
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              item.audience === 'Men' ? 'bg-sky-100 text-sky-700' :
              item.audience === 'Women' ? 'bg-fuchsia-100 text-fuchsia-700' :
              'bg-violet-100 text-violet-700'
            }`}>{item.audience || 'Unisex'}</span>
          </div>
        ))}
      </TableCell>
      <TableCell className="font-semibold text-stone-900">AED {order.total}</TableCell>
      <TableCell>
        <span className={`rounded px-2 py-1 text-xs capitalize ${getStatusBadgeClasses(order.status)}`}>{order.status}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm text-stone-500">
        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
      </TableCell>
      <OrderActionsCell orderId={order.id} currentStatus={order.status} onOrderUpdate={onOrderUpdate} />
      <ReturnInfoCell order={order} />
    </TableRow>
  );
};

export default OrderTableRow;
