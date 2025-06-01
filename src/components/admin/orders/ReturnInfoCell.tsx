
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface Order {
  status: string;
  notes: string | null;
}

interface ReturnInfoCellProps {
  order: Order;
}

const ReturnInfoCell: React.FC<ReturnInfoCellProps> = ({ order }) => {
  if (order.status === 'returned') {
    return (
      <TableCell>
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
              RETURNED
            </span>
          </div>
          {order.notes && order.notes.includes('Return Reason:') && (
            <div className="text-xs text-red-300">
              <div className="font-medium mb-1">Reason:</div>
              <div className="text-gray-300">
                {order.notes.replace('Return Reason: ', '')}
              </div>
            </div>
          )}
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <span className="text-gray-500 text-xs">—</span>
    </TableCell>
  );
};

export default ReturnInfoCell;
