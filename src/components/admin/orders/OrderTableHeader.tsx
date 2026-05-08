
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const OrderTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow className="border-gray-200">
        <TableHead className="text-gray-900">Order ID</TableHead>
        <TableHead className="text-gray-900">Customer Type</TableHead>
        <TableHead className="text-gray-900">Customer Info</TableHead>
        <TableHead className="text-gray-900">Contact Details</TableHead>
        <TableHead className="text-gray-900">Delivery Address</TableHead>
        <TableHead className="text-gray-900">Items</TableHead>
        <TableHead className="text-gray-900">Total</TableHead>
        <TableHead className="text-gray-900">Status</TableHead>
        <TableHead className="text-gray-900">Date</TableHead>
        <TableHead className="text-gray-900">Actions</TableHead>
        <TableHead className="text-gray-900">Return Info</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default OrderTableHeader;
