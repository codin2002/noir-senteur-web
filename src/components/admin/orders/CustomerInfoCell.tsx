
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  isGuest: boolean;
}

interface CustomerInfoCellProps {
  customer: CustomerInfo;
}

const CustomerInfoCell: React.FC<CustomerInfoCellProps> = ({ customer }) => {
  return (
    <>
      <TableCell>
        <span className={`px-2 py-1 rounded text-xs ${
          customer.isGuest 
            ? 'bg-orange-500/20 text-orange-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {customer.isGuest ? 'Guest' : 'Registered'}
        </span>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{customer.name}</div>
          <div className="text-sm text-gray-400">{customer.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {customer.phone !== 'Via user account' && 
           customer.phone !== 'No phone provided' && 
           customer.phone !== 'No phone' ? (
            <div className="text-gray-300">{customer.phone}</div>
          ) : (
            <div className="text-gray-500">No phone</div>
          )}
        </div>
      </TableCell>
    </>
  );
};

export default CustomerInfoCell;
