
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const useAdminOrders = (isAuthenticated: boolean) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => {
    console.log('🔄 Force refreshing orders data...');
    setRefreshKey(prev => prev + 1);
  };

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', refreshKey],
    queryFn: async () => {
      console.log('🔍 Fetching all orders for admin...');
      
      const { data, error } = await supabase.rpc('get_orders_with_items');

      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }

      console.log('✅ Fetched orders successfully:', data);
      
      const transformedOrders: Order[] = (data || []).map(order => ({
        ...order,
        notes: order.notes || null,
        items: Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : []
      }));
      
      console.log('📊 Orders by status:', {
        delivered: transformedOrders.filter(o => o.status === 'delivered').length,
        processing: transformedOrders.filter(o => o.status === 'processing').length,
        dispatched: transformedOrders.filter(o => o.status === 'dispatched').length,
        returned: transformedOrders.filter(o => o.status === 'returned').length,
        total: transformedOrders.length
      });
      
      return transformedOrders;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Auto-refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('🎯 Window gained focus - refreshing orders...');
      forceRefresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return {
    orders,
    isLoading,
    forceRefresh,
    refetch
  };
};
