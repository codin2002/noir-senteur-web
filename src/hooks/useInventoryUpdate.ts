
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reduceInventoryForOrder, adjustInventoryManually } from '@/services/inventoryOperationsService';

interface ManualAdjustmentParams {
  perfumeId: string;
  newQuantity: number;
  reason: string;
}

export const useInventoryUpdate = () => {
  const queryClient = useQueryClient();

  const reduceInventoryMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      console.log('🚀 useInventoryUpdate: Starting inventory reduction mutation for order:', orderId);
      const result = await reduceInventoryForOrder(orderId);
      console.log('✅ useInventoryUpdate: Inventory reduction completed successfully');
      return result;
    },
    onSuccess: () => {
      console.log('🔄 useInventoryUpdate: Mutation successful, invalidating queries...');
      
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
      console.error('❌ useInventoryUpdate: Failed to update inventory:', error);
      toast.error(`Failed to update inventory: ${error.message}`);
    }
  });

  // Manual inventory adjustment with logging
  const manualAdjustmentMutation = useMutation({
    mutationFn: async ({ perfumeId, newQuantity, reason }: ManualAdjustmentParams) => {
      console.log('🔧 useInventoryUpdate: Starting manual adjustment mutation');
      return adjustInventoryManually(perfumeId, newQuantity, reason);
    },
    onSuccess: () => {
      console.log('✅ useInventoryUpdate: Manual adjustment successful, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
      toast.success('Manual inventory adjustment completed successfully');
    },
    onError: (error: any) => {
      console.error('❌ useInventoryUpdate: Manual adjustment failed:', error);
      toast.error(`Failed to adjust inventory: ${error.message}`);
    }
  });

  // Add a function to manually trigger inventory reduction for testing
  const testInventoryReduction = async (orderId: string) => {
    console.log('🧪 Testing inventory reduction for order:', orderId);
    return reduceInventoryMutation.mutateAsync({ orderId });
  };

  return {
    reduceInventory: (params: { orderId: string }) => {
      console.log('📞 useInventoryUpdate: reduceInventory called with params:', params);
      return reduceInventoryMutation.mutate(params);
    },
    reduceInventoryAsync: (params: { orderId: string }) => {
      console.log('📞 useInventoryUpdate: reduceInventoryAsync called with params:', params);
      return reduceInventoryMutation.mutateAsync(params);
    },
    manualAdjustment: manualAdjustmentMutation.mutateAsync,
    testInventoryReduction,
    isUpdating: reduceInventoryMutation.isPending || manualAdjustmentMutation.isPending
  };
};
