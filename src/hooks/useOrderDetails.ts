
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

interface DeliveryInfo {
  contactName: string;
  phone: string;
  email: string;
  address: string;
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
  user_profile?: {
    full_name: string | null;
    phone: string | null;
  };
  items: OrderItem[];
  parsed_delivery_info?: DeliveryInfo;
}

export const useOrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseDeliveryInfo = (deliveryAddress: string): DeliveryInfo => {
    const defaultInfo: DeliveryInfo = {
      contactName: '',
      phone: '',
      email: '',
      address: ''
    };

    if (!deliveryAddress) return defaultInfo;

    // Check if it's the new structured format with |
    if (deliveryAddress.includes('|')) {
      const parts = deliveryAddress.split('|');
      const info = { ...defaultInfo };
      
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.startsWith('Contact:')) {
          info.contactName = trimmed.replace('Contact:', '').trim();
        } else if (trimmed.startsWith('Phone:')) {
          info.phone = trimmed.replace('Phone:', '').trim();
        } else if (trimmed.startsWith('Email:')) {
          info.email = trimmed.replace('Email:', '').trim();
        } else if (trimmed.startsWith('Address:')) {
          info.address = trimmed.replace('Address:', '').trim();
        }
      });
      
      return info;
    } else {
      // Legacy format - treat entire string as address
      return {
        ...defaultInfo,
        address: deliveryAddress
      };
    }
  };

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
      
      // Type cast the items properly and ensure calculations are correct
      const items = Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : [];
      
      // Process items to ensure accurate data
      const processedItems = items.map(item => ({
        ...item,
        // Ensure price and quantity are properly set from the order_items table
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      }));
      
      let userProfile = null;
      
      // If this is a registered user order, fetch their profile
      if (order.user_id && !order.guest_name) {
        console.log('Fetching user profile for user_id:', order.user_id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', order.user_id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else {
          userProfile = profileData;
          console.log('User profile found:', userProfile);
        }
      }
      
      // Parse delivery information
      const parsedDeliveryInfo = parseDeliveryInfo(order.delivery_address || '');
      
      const orderWithTypedItems = {
        ...order,
        items: processedItems,
        user_profile: userProfile,
        parsed_delivery_info: parsedDeliveryInfo,
        // Use the actual order total from database (includes shipping)
        total: Number(order.total) || 0
      };
      
      console.log('Processed order details:', orderWithTypedItems);
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
