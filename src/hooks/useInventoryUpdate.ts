
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderItem {
  perfume_id: string;
  quantity: number;
}

export const useInventoryUpdate = () => {
  const queryClient = useQueryClient();

  const reduceInventoryMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      console.log('🔄 Starting inventory reduction for order:', orderId);

      // First, get the order items
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select('perfume_id, quantity')
        .eq('order_id', orderId);

      if (orderError) {
        console.error('❌ Error fetching order items:', orderError);
        throw orderError;
      }

      if (!orderItems || orderItems.length === 0) {
        console.warn('⚠️ No order items found for order:', orderId);
        return;
      }

      console.log('📦 Order items found:', orderItems);

      // For each item, reduce the inventory
      for (const item of orderItems as OrderItem[]) {
        console.log(`🔽 Processing perfume ${item.perfume_id}, reducing ${item.quantity} units`);

        // Get current inventory
        const { data: inventory, error: inventoryError } = await supabase
          .from('inventory')
          .select('stock_quantity, id')
          .eq('perfume_id', item.perfume_id)
          .single();

        if (inventoryError) {
          console.error('❌ Error fetching inventory for perfume:', item.perfume_id, inventoryError);
          // If no inventory record exists, create one with 0 stock
          if (inventoryError.code === 'PGRST116') {
            console.log('📝 Creating new inventory record for perfume:', item.perfume_id);
            const { error: createError } = await supabase
              .from('inventory')
              .insert({
                perfume_id: item.perfume_id,
                stock_quantity: 0,
                low_stock_threshold: 5
              });
            
            if (createError) {
              console.error('❌ Error creating inventory record:', createError);
              throw createError;
            }
            console.log('✅ Created inventory record with 0 stock for perfume:', item.perfume_id);
            continue;
          }
          throw inventoryError;
        }

        if (!inventory) {
          console.warn('⚠️ No inventory record found for perfume:', item.perfume_id);
          continue;
        }

        const currentStock = inventory.stock_quantity;
        const newQuantity = Math.max(0, currentStock - item.quantity);
        
        console.log(`📊 Inventory update: ${item.perfume_id} | Current: ${currentStock} | Reducing: ${item.quantity} | New: ${newQuantity}`);
        
        // Update inventory with explicit timestamp
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ 
            stock_quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('perfume_id', item.perfume_id);

        if (updateError) {
          console.error('❌ Error updating inventory for perfume:', item.perfume_id, updateError);
          throw updateError;
        }

        console.log(`✅ Successfully updated inventory for ${item.perfume_id}: ${currentStock} → ${newQuantity}`);
      }

      console.log('🎉 Inventory reduction completed successfully for order:', orderId);
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh the UI immediately
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      
      // Also refetch data to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['inventory'] });
      
      console.log('✅ Inventory updated successfully - queries invalidated and refetched');
      toast.success('Inventory updated successfully');
    },
    onError: (error: any) => {
      console.error('❌ Failed to update inventory:', error);
      toast.error(`Failed to update inventory: ${error.message}`);
    }
  });

  // Add a function to manually trigger inventory reduction for testing
  const testInventoryReduction = async (orderId: string) => {
    console.log('🧪 Testing inventory reduction for order:', orderId);
    return reduceInventoryMutation.mutateAsync({ orderId });
  };

  return {
    reduceInventory: reduceInventoryMutation.mutate,
    reduceInventoryAsync: reduceInventoryMutation.mutateAsync,
    testInventoryReduction,
    isUpdating: reduceInventoryMutation.isPending
  };
};
