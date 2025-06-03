
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderItem {
  perfume_id: string;
  quantity: number;
}

export const useInventoryUpdate = () => {
  const queryClient = useQueryClient();

  // Function to log inventory changes
  const logInventoryChange = async (
    perfumeId: string,
    changeType: 'manual_adjustment' | 'order_delivery' | 'stock_addition' | 'return_processing',
    quantityBefore: number,
    quantityAfter: number,
    reason: string,
    orderId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('inventory_logs')
        .insert({
          perfume_id: perfumeId,
          change_type: changeType,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          quantity_change: quantityAfter - quantityBefore,
          reason,
          order_id: orderId
        });

      if (error) {
        console.error('❌ Error logging inventory change:', error);
      } else {
        console.log('✅ Inventory change logged successfully');
      }
    } catch (error) {
      console.error('❌ Failed to log inventory change:', error);
    }
  };

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

      // For each item, reduce the inventory and log the change
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

            // Log the creation with zero reduction
            await logInventoryChange(
              item.perfume_id,
              'order_delivery',
              0,
              0,
              `Order delivery - No stock available (Order: ${orderId.substring(0, 8)})`,
              orderId
            );

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
        
        // Update inventory
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

        // Log the inventory change
        await logInventoryChange(
          item.perfume_id,
          'order_delivery',
          currentStock,
          newQuantity,
          `Inventory reduced for delivered order (Order: ${orderId.substring(0, 8)})`,
          orderId
        );

        console.log(`✅ Successfully updated and logged inventory for ${item.perfume_id}: ${currentStock} → ${newQuantity}`);
      }

      console.log('🎉 Inventory reduction completed successfully for order:', orderId);
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh the UI immediately
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      
      // Also refetch data to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['inventory'] });
      queryClient.refetchQueries({ queryKey: ['inventory-summary'] });
      
      console.log('✅ Inventory updated successfully - queries invalidated and refetched');
      toast.success('Inventory reduced successfully for delivered order');
    },
    onError: (error: any) => {
      console.error('❌ Failed to update inventory:', error);
      toast.error(`Failed to update inventory: ${error.message}`);
    }
  });

  // Manual inventory adjustment with logging
  const manualAdjustmentMutation = useMutation({
    mutationFn: async ({ 
      perfumeId, 
      newQuantity, 
      reason 
    }: { 
      perfumeId: string; 
      newQuantity: number; 
      reason: string; 
    }) => {
      // Get current inventory
      const { data: inventory, error: fetchError } = await supabase
        .from('inventory')
        .select('stock_quantity')
        .eq('perfume_id', perfumeId)
        .single();

      if (fetchError) throw fetchError;

      const currentStock = inventory.stock_quantity;

      // Update inventory
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ stock_quantity: newQuantity })
        .eq('perfume_id', perfumeId);

      if (updateError) throw updateError;

      // Log the change
      await logInventoryChange(
        perfumeId,
        'manual_adjustment',
        currentStock,
        newQuantity,
        reason
      );

      return { currentStock, newQuantity };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
      toast.success('Manual inventory adjustment completed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to adjust inventory: ${error.message}`);
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
    manualAdjustment: manualAdjustmentMutation.mutateAsync,
    testInventoryReduction,
    isUpdating: reduceInventoryMutation.isPending || manualAdjustmentMutation.isPending
  };
};
