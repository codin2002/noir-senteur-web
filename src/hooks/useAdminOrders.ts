
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
    refetchInterval: false, // Disable automatic refetching to prevent status conflicts
    staleTime: 0, // Always consider data stale so manual refreshes work immediately
  });

  // Auto-refresh when window gains focus, but with debounce to prevent conflicts
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleFocus = () => {
      console.log('🎯 Window gained focus - scheduling orders refresh...');
      // Debounce the refresh to prevent conflicts during status updates
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        forceRefresh();
      }, 1000); // Wait 1 second before refreshing
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    orders,
    isLoading,
    forceRefresh,
    refetch
  };
};
