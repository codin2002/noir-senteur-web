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
        {order.traffic_source === 'meta_ads' ? (
          <div title="A Meta click was detected for this order. Final attribution remains in Meta Ads Manager.">
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">Meta click</span>
            {(order.utm_campaign || order.utm_content) && (
              <p className="mt-1 max-w-[150px] truncate text-[11px] text-stone-500" title={[order.utm_campaign, order.utm_content].filter(Boolean).join(' / ')}>
                {[order.utm_campaign, order.utm_content].filter(Boolean).join(' / ')}
              </p>
            )}
          </div>
        ) : order.traffic_source === 'direct' ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">Direct</span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Unknown</span>
        )}
      </TableCell>
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
