
import React from 'react';
import { TableCell } from '@/components/ui/table';
import OrderStatusManager from '@/components/admin/OrderStatusManager';
import OrderReturnManager from '@/components/admin/OrderReturnManager';
import InvoiceGenerator from '@/components/admin/InvoiceGenerator';

interface OrderActionsCellProps {
  orderId: string;
  currentStatus: string;
  onOrderUpdate: () => void;
}

const OrderActionsCell: React.FC<OrderActionsCellProps> = ({
  orderId,
  currentStatus,
  onOrderUpdate
}) => {
  return (
    <TableCell>
      <div className="flex flex-col gap-2">
        <OrderStatusManager
          orderId={orderId}
          currentStatus={currentStatus}
          onStatusUpdated={onOrderUpdate}
        />
        <div className="flex gap-2">
          <OrderReturnManager
            orderId={orderId}
            currentStatus={currentStatus}
            onStatusUpdated={onOrderUpdate}
          />
          <InvoiceGenerator orderId={orderId} />
        </div>
      </div>
    </TableCell>
  );
};

export default OrderActionsCell;
