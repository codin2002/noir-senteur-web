import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { TableCell, TableRow } from '@/components/ui/table';
import CustomerInfoCell from './CustomerInfoCell';
import OrderActionsCell from './OrderActionsCell';
import ReturnInfoCell from './ReturnInfoCell';
import { AdminOrder } from '@/types/adminOrder';
import { getCustomerInfo, getDeliveryAddress, getOrderAttributionCategory, getOrderEmirate, getStatusBadgeClasses } from '@/utils/orderUtils';

interface OrderTableRowProps {
  order: AdminOrder;
  onOrderUpdate: () => void;
}

const OrderTableRow: React.FC<OrderTableRowProps> = ({ order, onOrderUpdate }) => {
  const customer = getCustomerInfo(order);
  const deliveryAddress = getDeliveryAddress(order);
  const emirate = getOrderEmirate(order);
  const attributionCategory = getOrderAttributionCategory(order);
  const createdAt = new Date(order.created_at);

  return (
    <TableRow className="border-stone-200">
      <TableCell className="font-mono text-sm text-stone-700">
        <div>{order.id.split('-')[0]}…</div>
        {order.order_source === 'manual' && <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">Manual</span>}
      </TableCell>
      <CustomerInfoCell customer={customer} />
      <TableCell>
        <div className="text-sm font-medium text-stone-900">{emirate}</div>
        <div className="max-w-[180px] truncate text-xs text-stone-500" title={deliveryAddress}>{deliveryAddress}</div>
      </TableCell>
      <TableCell>
        {order.order_source === 'manual' && order.manual_lines && order.manual_lines.length > 0
          ? order.manual_lines.map((line, index) => (
          <div key={`${line.label}-${index}`} className="mb-1.5 whitespace-nowrap text-sm last:mb-0">
            <span className="font-medium text-stone-900">{line.label}</span>
            <span className="ml-1 text-stone-500">×{line.quantity}</span>
            <span className="ml-2 text-stone-500">AED {Number(line.unit_price).toFixed(2)}</span>
          </div>
          ))
          : order.items.map((item) => (
          <div key={item.id} className="mb-1.5 whitespace-nowrap text-sm last:mb-0">
            <span className="font-medium text-stone-900">{item.perfume.name}</span>
            <span className="ml-1 text-stone-500">×{item.quantity}</span>
          </div>
        ))}
      </TableCell>
      <TableCell className="font-semibold text-stone-900">AED {order.total}</TableCell>
      <TableCell>
        {attributionCategory === 'meta_ads' ? (
          <div title="A Meta click was detected for this order. Final attribution remains in Meta Ads Manager.">
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">Meta click</span>
            {(order.utm_campaign || order.utm_content) && (
              <p className="mt-1 max-w-[150px] truncate text-[11px] text-stone-500" title={[order.utm_campaign, order.utm_content].filter(Boolean).join(' / ')}>
                {[order.utm_campaign, order.utm_content].filter(Boolean).join(' / ')}
              </p>
            )}
          </div>
        ) : attributionCategory === 'direct' ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">Direct</span>
        ) : attributionCategory === 'manual' ? (
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">Manual entry</span>
        ) : attributionCategory === 'not_recorded' ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600" title="Source tracking was not active when this order was placed. This group may include Meta orders.">Historical source unavailable</span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Unknown</span>
        )}
      </TableCell>
      <TableCell>
        <span className={`rounded px-2 py-1 text-xs capitalize ${getStatusBadgeClasses(order.status)}`}>{order.status}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm text-stone-500">
        <div className="font-medium text-stone-700">{format(createdAt, 'dd MMM yyyy, h:mm a')}</div>
        <div className="text-xs">{formatDistanceToNow(createdAt, { addSuffix: true })}</div>
      </TableCell>
      <OrderActionsCell orderId={order.id} currentStatus={order.status} onOrderUpdate={onOrderUpdate} />
      <ReturnInfoCell order={order} />
    </TableRow>
  );
};

export default OrderTableRow;
