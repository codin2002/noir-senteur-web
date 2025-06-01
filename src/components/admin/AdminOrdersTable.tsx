
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import OrdersSearchBar from '@/components/admin/OrdersSearchBar';
import OrderTableHeader from '@/components/admin/orders/OrderTableHeader';
import OrderTableRow from '@/components/admin/orders/OrderTableRow';
import { getCustomerInfo } from '@/utils/orderUtils';

interface OrderItem {
  id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: {
    name: string;
    price: string;
  };
}

interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  delivery_address: string | null;
  notes: string | null;
  items: OrderItem[];
}

interface AdminOrdersTableProps {
  orders: Order[];
  onRefresh: () => void;
}

const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({ orders, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) {
      return orders;
    }

    const searchLower = searchTerm.toLowerCase();
    
    return orders.filter((order) => {
      const customer = getCustomerInfo(order);
      const customerName = customer.name.toLowerCase();
      const orderId = order.id.toLowerCase();
      const customerEmail = customer.email.toLowerCase();
      
      return customerName.includes(searchLower) || 
             orderId.includes(searchLower) ||
             customerEmail.includes(searchLower);
    });
  }, [orders, searchTerm]);

  const handleOrderUpdate = () => {
    console.log('🔄 Order updated in admin table - refreshing data...');
    onRefresh();
  };

  return (
    <Card className="bg-darker border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold">Order Management</CardTitle>
      </CardHeader>
      <CardContent>
        <OrdersSearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        {filteredOrders && filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <OrderTableHeader />
              <TableBody>
                {filteredOrders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    onOrderUpdate={handleOrderUpdate}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            {searchTerm ? `No orders found matching "${searchTerm}"` : 'No orders found.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrdersTable;
