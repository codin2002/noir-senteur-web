
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusManager from '@/components/admin/OrderStatusManager';
import OrderReturnManager from '@/components/admin/OrderReturnManager';
import InvoiceGenerator from '@/components/admin/InvoiceGenerator';
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
  notes: string | null;
  items: OrderItem[];
}

const AdminOrders = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if admin is already authenticated in session storage
  useEffect(() => {
    console.log('AdminOrders: Checking authentication status...');
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    console.log('AdminOrders: Found auth status:', adminAuth);
    
    setIsAuthenticated(adminAuth === 'true');
    setIsCheckingAuth(false);
  }, []);

  const handleAuthenticated = () => {
    console.log('AdminOrders: Authentication successful');
    setIsAuthenticated(true);
    sessionStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    console.log('AdminOrders: Logging out');
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  // Only enable the query if authenticated
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
    },
    enabled: isAuthenticated // Only run query when authenticated
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

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4 text-gold">Loading...</h2>
          <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif mb-8 text-gold">Admin Dashboard</h1>
          <div className="text-center text-gold">Loading orders...</div>
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
            onClick={handleLogout}
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
                      <TableHead className="text-gold">Return Info</TableHead>
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
                                : order.status === 'returned'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-400">
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <OrderStatusManager
                                orderId={order.id}
                                currentStatus={order.status}
                                onStatusUpdated={refetch}
                              />
                              <div className="flex gap-2">
                                <OrderReturnManager
                                  orderId={order.id}
                                  currentStatus={order.status}
                                  onStatusUpdated={refetch}
                                />
                                <InvoiceGenerator orderId={order.id} />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.status === 'returned' ? (
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
                            ) : (
                              <span className="text-gray-500 text-xs">—</span>
                            )}
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
