
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
      
      setIsLoading(true);
      
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
      const processedOrders: Order[] = userOrders.map(order => {
        const items = Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : [];
        
        // Process items to ensure accurate data
        const processedItems = items.map(item => ({
          ...item,
          // Ensure price and quantity are properly set from the order_items table
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1
        }));
        
        // Use the order total from database directly (already includes shipping)
        const orderTotal = Number(order.total) || 0;
        
        console.log(`Order ${order.id}: Total from DB: ${orderTotal}, Items: ${processedItems.length}, Status: ${order.status}`);
        
        return {
          id: order.id,
          created_at: order.created_at,
          status: order.status,
          total: orderTotal, // Use database total directly
          items: processedItems
        };
      });
      
      console.log('Processed orders for display:', processedOrders);
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

  const refreshOrders = async () => {
    console.log('=== REFRESHING ORDERS DATA ===');
    await fetchOrders();
    toast.success('Order history refreshed');
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
    refreshOrders,
    formatDate
  };
};
