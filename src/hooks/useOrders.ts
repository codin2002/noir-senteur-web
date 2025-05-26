
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderItem } from '@/types/profile';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      console.log('=== FETCHING ORDERS FOR USER ===');
      console.log('User ID:', user?.id);
      
      // Use the RPC function to get orders with items
      const { data: ordersData, error: ordersError } = await supabase.rpc('get_orders_with_items', {
        user_uuid: user?.id
      });
        
      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
        throw ordersError;
      }
      
      console.log('Orders data received:', ordersData);
      
      // Filter to only show orders for the current user (extra safety)
      const userOrders = (ordersData || []).filter(order => order.user_id === user?.id);
      
      // Process the orders to match our Order type with proper type casting
      const processedOrders: Order[] = userOrders.map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total: order.total,
        // Safely cast items from Json to OrderItem[] with validation
        items: Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : []
      }));
      
      console.log('Processed orders:', processedOrders);
      setOrders(processedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load purchase history', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return {
    orders,
    isLoading,
    fetchOrders,
    formatDate
  };
};
