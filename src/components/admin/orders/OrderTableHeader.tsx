
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const OrderTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow className="border-gold/20">
        <TableHead className="text-gold">Order ID</TableHead>
        <TableHead className="text-gold">Customer Type</TableHead>
        <TableHead className="text-gold">Customer Info</TableHead>
        <TableHead className="text-gold">Contact Details</TableHead>
        <TableHead className="text-gold">Delivery Address</TableHead>
        <TableHead className="text-gold">Items</TableHead>
        <TableHead className="text-gold">Total</TableHead>
        <TableHead className="text-gold">Status</TableHead>
        <TableHead className="text-gold">Date</TableHead>
        <TableHead className="text-gold">Actions</TableHead>
        <TableHead className="text-gold">Return Info</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default OrderTableHeader;
