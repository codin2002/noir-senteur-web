
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminOrder, AdminOrderItem, ProductAudience } from '@/types/adminOrder';

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
      
      const { data, error } = await supabase.rpc('get_orders_with_items');

      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }

      console.log('✅ Fetched orders successfully:', data?.length, 'orders');
      
      const perfumeIds = Array.from(new Set((data || []).flatMap((order) =>
        (Array.isArray(order.items) ? order.items : [])
          .map((item: unknown) => (item as { perfume_id?: string }).perfume_id)
          .filter((id): id is string => Boolean(id))
      )));
      const audienceByPerfume = new Map<string, ProductAudience>();

      if (perfumeIds.length > 0) {
        const { data: classifications, error: classificationError } = await supabase
          .from('perfume_classifications')
          .select('perfume_id, audience_masculine, audience_feminine')
          .in('perfume_id', perfumeIds);

        if (classificationError) {
          console.warn('Unable to load product audience classifications:', classificationError);
        } else {
          classifications?.forEach((classification) => {
            const difference = classification.audience_masculine - classification.audience_feminine;
            audienceByPerfume.set(
              classification.perfume_id,
              Math.abs(difference) <= 5 ? 'Unisex' : difference > 0 ? 'Men' : 'Women'
            );
          });
        }
      }

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
          items: Array.isArray(order.items)
            ? (order.items as unknown as AdminOrderItem[]).map((item) => ({
                ...item,
                audience: audienceByPerfume.get(item.perfume_id) || 'Unisex'
              }))
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
