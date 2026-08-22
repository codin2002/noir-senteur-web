
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminOrder, AdminOrderItem, ManualOrderLine } from '@/types/adminOrder';

export const useAdminOrders = (isAuthenticated: boolean) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const queryClient = useQueryClient();

  const forceRefresh = () => {
    console.log('🔄 Force refreshing orders data...');
    setRefreshKey(prev => prev + 1);
    
    // Invalidate all related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.removeQueries({ queryKey: ['admin-orders'] });
    queryClient.removeQueries({ queryKey: ['orders'] });
  };

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', refreshKey],
    queryFn: async () => {
      console.log('🔍 Fetching all orders for admin with refresh key:', refreshKey);
      
      // Add a longer delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase.rpc('get_orders_with_items_v2' as never);

      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }

      console.log('✅ Fetched orders successfully:', data?.length, 'orders');
      
      const transformedOrders: AdminOrder[] = (data || []).map(order => {
        console.log(`📦 Order ${order.id}:`, {
          user_id: order.user_id,
          guest_name: order.guest_name,
          guest_email: order.guest_email,
          guest_phone: order.guest_phone,
          status: order.status
        });
        
        return {
          ...order,
          notes: order.notes || null,
          manual_lines: Array.isArray(order.manual_lines) ? order.manual_lines as unknown as ManualOrderLine[] : [],
          items: Array.isArray(order.items)
            ? (order.items as unknown as AdminOrderItem[])
            : []
        };
      });
      
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
    refetchInterval: false,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
  });

  // Auto-refresh when window gains focus
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleFocus = () => {
      console.log('🎯 Window gained focus - scheduling orders refresh...');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        forceRefresh();
      }, 500);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👀 Page became visible - refreshing orders...');
        forceRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
