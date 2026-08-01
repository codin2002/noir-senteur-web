import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import OrdersSearchBar from '@/components/admin/OrdersSearchBar';
import OrderTableHeader from '@/components/admin/orders/OrderTableHeader';
import OrderTableRow from '@/components/admin/orders/OrderTableRow';
import { AdminOrder } from '@/types/adminOrder';
import { getCustomerInfo, getOrderEmirate } from '@/utils/orderUtils';

interface AdminOrdersTableProps {
  orders: AdminOrder[];
  onRefresh: () => void;
}

const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({ orders, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emirateFilter, setEmirateFilter] = useState('all');
  const emirates = useMemo(() => Array.from(new Set(orders.map(getOrderEmirate))).sort(), [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return orders.filter((order) => {
      const customer = getCustomerInfo(order);
      const matchesSearch = !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.perfume.name.toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'all' || (
        statusFilter === 'pending'
          ? !['delivered', 'returned'].includes(order.status)
          : order.status === statusFilter
      );
      const matchesEmirate = emirateFilter === 'all' || getOrderEmirate(order) === emirateFilter;
      return matchesSearch && matchesStatus && matchesEmirate;
    });
  }, [orders, searchTerm, statusFilter, emirateFilter]);

  return (
    <Card className="border-stone-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-xl text-stone-950">All orders</CardTitle>
            <p className="mt-1 text-sm text-stone-500">{filteredOrders.length} of {orders.length} orders shown</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Filter by order status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm">
              <option value="all">All statuses</option>
              <option value="pending">Pending delivery</option>
              <option value="processing">Processing</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
            </select>
            <select aria-label="Filter by Emirate" value={emirateFilter} onChange={(event) => setEmirateFilter(event.target.value)} className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm">
              <option value="all">All Emirates</option>
              {emirates.map((emirate) => <option key={emirate} value={emirate}>{emirate}</option>)}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <OrdersSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <OrderTableHeader />
              <TableBody>
                {filteredOrders.map((order) => <OrderTableRow key={order.id} order={order} onOrderUpdate={onRefresh} />)}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center text-stone-400">No orders match the selected filters.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrdersTable;
