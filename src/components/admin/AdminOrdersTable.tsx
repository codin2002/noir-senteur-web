import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import OrdersSearchBar from '@/components/admin/OrdersSearchBar';
import OrderTableHeader from '@/components/admin/orders/OrderTableHeader';
import OrderTableRow from '@/components/admin/orders/OrderTableRow';
import { AdminOrder } from '@/types/adminOrder';
import { getCustomerInfo, getOrderAttributionCategory, getOrderEmirate } from '@/utils/orderUtils';

interface AdminOrdersTableProps {
  orders: AdminOrder[];
  onRefresh: () => void;
}

const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({ orders, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emirateFilter, setEmirateFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const emirates = useMemo(() => Array.from(new Set(orders.map(getOrderEmirate))).sort(), [orders]);
  const sourceCounts = useMemo(() => orders.reduce<Record<string, number>>((counts, order) => {
    const source = getOrderAttributionCategory(order);
    counts[source] = (counts[source] || 0) + 1;
    return counts;
  }, {}), [orders]);

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
      const matchesSource = sourceFilter === 'all' || getOrderAttributionCategory(order) === sourceFilter;
      return matchesSearch && matchesStatus && matchesEmirate && matchesSource;
    }).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  }, [orders, searchTerm, statusFilter, emirateFilter, sourceFilter]);

  return (
    <Card className="border-stone-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-xl text-stone-950">All orders</CardTitle>
            <p className="mt-1 text-sm text-stone-500">{filteredOrders.length} of {orders.length} orders shown</p>
            <p className="mt-1 text-xs text-stone-500">
              {sourceCounts.meta_ads || 0} confirmed Meta clicks · {sourceCounts.not_recorded || 0} historical sources unavailable (may include Meta)
            </p>
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
            <select aria-label="Filter by order source" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm">
              <option value="all">All sources</option>
              <option value="meta_ads">Confirmed Meta clicks</option>
              <option value="direct">Direct</option>
              <option value="manual">Manual entries</option>
              <option value="not_recorded">Historical source unavailable</option>
              <option value="unknown">Unknown</option>
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
