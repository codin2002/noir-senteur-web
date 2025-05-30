
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
      console.log('🔄 Reducing inventory for order:', orderId);

      // First, get the order items
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select('perfume_id, quantity')
        .eq('order_id', orderId);

      if (orderError) {
        console.error('❌ Error fetching order items:', orderError);
        throw orderError;
      }

      console.log('📦 Order items found:', orderItems);

      // For each item, reduce the inventory
      for (const item of orderItems as OrderItem[]) {
        console.log(`🔽 Reducing ${item.quantity} units for perfume ${item.perfume_id}`);

        // Get current inventory
        const { data: inventory, error: inventoryError } = await supabase
          .from('inventory')
          .select('stock_quantity')
          .eq('perfume_id', item.perfume_id)
          .single();

        if (inventoryError) {
          console.error('❌ Error fetching inventory:', inventoryError);
          // Don't throw here, just log and continue
          continue;
        }

        if (!inventory) {
          console.warn('⚠️ No inventory record found for perfume:', item.perfume_id);
          continue;
        }

        const newQuantity = Math.max(0, inventory.stock_quantity - item.quantity);
        
        // Update inventory
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ stock_quantity: newQuantity })
          .eq('perfume_id', item.perfume_id);

        if (updateError) {
          console.error('❌ Error updating inventory:', updateError);
          throw updateError;
        }

        console.log(`✅ Updated inventory for ${item.perfume_id}: ${inventory.stock_quantity} → ${newQuantity}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      console.log('✅ Inventory updated successfully');
    },
    onError: (error: any) => {
      console.error('❌ Failed to update inventory:', error);
      toast.error(`Failed to update inventory: ${error.message}`);
    }
  });

  return {
    reduceInventory: reduceInventoryMutation.mutate,
    isUpdating: reduceInventoryMutation.isPending
  };
};
