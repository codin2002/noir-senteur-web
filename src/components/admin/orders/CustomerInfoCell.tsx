
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
            ? 'bg-orange-100 text-orange-700 border border-orange-300'
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          {customer.isGuest ? 'Guest' : 'Registered'}
        </span>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {customer.phone !== 'Via user account' && 
           customer.phone !== 'No phone provided' && 
           customer.phone !== 'No phone' ? (
            <div className="text-gray-700">{customer.phone}</div>
          ) : (
            <div className="text-gray-400">No phone</div>
          )}
        </div>
      </TableCell>
    </>
  );
};

export default CustomerInfoCell;
