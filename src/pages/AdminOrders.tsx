import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusManager from '@/components/admin/OrderStatusManager';
import InventoryManager from '@/components/admin/InventoryManager';
import AdminAuth from '@/components/admin/AdminAuth';
import { formatDistanceToNow } from 'date-fns';

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
  items: OrderItem[];
}

const AdminOrders = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if admin is already authenticated in session storage
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('admin_authenticated', 'true');
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      console.log('🔍 Fetching all orders for admin...');
      
      const { data, error } = await supabase.rpc('get_orders_with_items');

      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }

      console.log('✅ Fetched orders successfully:', data);
      
      // Transform the data to match our Order interface
      const transformedOrders: Order[] = (data || []).map(order => ({
        ...order,
        items: Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : []
      }));
      
      return transformedOrders;
    }
  });

  const getCustomerInfo = (order: Order) => {
    if (order.guest_name) {
      return {
        name: order.guest_name,
        email: order.guest_email || 'No email',
        phone: order.guest_phone || 'No phone'
      };
    }
    return {
      name: 'Registered User',
      email: 'Via user account',
      phone: 'Via user account'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif mb-8 text-gold">Admin Dashboard</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif mb-8 text-gold">Admin Dashboard</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_authenticated');
              setIsAuthenticated(false);
            }}
            className="text-gold hover:text-gold/70 text-sm"
          >
            Logout
          </button>
        </div>
        
        {/* Inventory Management Section */}
        <InventoryManager />
        
        {/* Orders Management Section */}
        <Card className="bg-darker border-gold/20">
          <CardHeader>
            <CardTitle className="text-gold">Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/20">
                      <TableHead className="text-gold">Order ID</TableHead>
                      <TableHead className="text-gold">Customer</TableHead>
                      <TableHead className="text-gold">Items</TableHead>
                      <TableHead className="text-gold">Total</TableHead>
                      <TableHead className="text-gold">Status</TableHead>
                      <TableHead className="text-gold">Date</TableHead>
                      <TableHead className="text-gold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const customer = getCustomerInfo(order);
                      return (
                        <TableRow key={order.id} className="border-gold/10">
                          <TableCell className="font-mono text-sm">
                            {order.id.split('-')[0]}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-400">{customer.email}</div>
                              {customer.phone !== 'Via user account' && (
                                <div className="text-sm text-gray-400">{customer.phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.items.map((item, index) => (
                              <div key={item.id} className="text-sm">
                                {item.perfume.name} (×{item.quantity})
                                {index < order.items.length - 1 && <br />}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell className="font-semibold">
                            AED {order.total}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'delivered' 
                                ? 'bg-green-500/20 text-green-400'
                                : order.status === 'dispatched'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-400">
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <OrderStatusManager
                              orderId={order.id}
                              currentStatus={order.status}
                              onStatusUpdated={refetch}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No orders found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrders;
