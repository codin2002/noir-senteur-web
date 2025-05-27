
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: {
    id: string;
    name: string;
    image: string;
    price: string;
    price_value: number;
  };
}

interface OrderDetails {
  id: string;
  total: number;
  status: string;
  created_at: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  delivery_address?: string;
  user_id?: string;
  items: OrderItem[];
}

export const useOrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching order details for order ID:', orderId);
      
      // Use the existing get_orders_with_items function but filter by order ID
      const { data: orderData, error: orderError } = await supabase.rpc('get_orders_with_items');
      
      if (orderError) {
        console.error('Error fetching orders:', orderError);
        throw orderError;
      }
      
      // Find the specific order by ID
      const order = orderData?.find((o: any) => o.id === orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      console.log('Order details found:', order);
      
      // Type cast the items properly
      const orderWithTypedItems = {
        ...order,
        items: Array.isArray(order.items) ? order.items as OrderItem[] : []
      };
      
      setOrderDetails(orderWithTypedItems);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orderDetails,
    isLoading,
    fetchOrderDetails,
    clearOrderDetails: () => setOrderDetails(null)
  };
};
