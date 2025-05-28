
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import { toast } from 'sonner';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  guest_name?: string;
  guest_email?: string;
  user_id?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      const { data: ordersData, error } = await supabase.rpc('get_orders_with_items');
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      console.log('Orders fetched:', ordersData);
      setOrders(ordersData || []);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
    fetchOrders(); // Refresh orders when modal closes
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white p-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-gold mb-2">Order Management</h1>
          <p className="text-muted-foreground">
            Manage and update order statuses
          </p>
        </div>

        <Card className="bg-darker border-gold/20">
          <CardHeader>
            <CardTitle className="text-gold">All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold/20">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gold/10">
                        <td className="py-3 px-4 font-mono text-sm">
                          #{order.id.substring(0, 8)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          {order.guest_name || order.guest_email || 'Registered User'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          AED {order.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                            className="border-gold text-gold hover:bg-gold hover:text-darker"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          orderId={selectedOrderId}
          showAdmin={true}
        />
      </div>
    </div>
  );
};

export default AdminOrders;
