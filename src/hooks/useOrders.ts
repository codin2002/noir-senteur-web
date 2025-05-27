
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
      
      // Process the orders to match our Order type with proper type casting and fixed calculations
      const processedOrders: Order[] = userOrders.map(order => {
        const items = Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : [];
        
        // FIXED: Recalculate total from actual order items to ensure accuracy
        let calculatedSubtotal = 0;
        const processedItems = items.map(item => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          calculatedSubtotal += itemTotal;
          return {
            ...item,
            // Ensure price and quantity are properly set
            price: item.price || 0,
            quantity: item.quantity || 1
          };
        });
        
        // FIXED: Use the actual order total from database, don't recalculate
        // The database total already includes shipping and is correct
        const orderTotal = order.total || 0;
        
        console.log(`Order ${order.id}: DB Total: ${orderTotal}, Calculated Subtotal: ${calculatedSubtotal}, Items: ${processedItems.length}`);
        
        return {
          id: order.id,
          created_at: order.created_at,
          status: order.status,
          total: orderTotal, // FIXED: Use database total directly
          items: processedItems
        };
      });
      
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
