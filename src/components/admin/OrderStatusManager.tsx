
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryUpdate } from '@/hooks/useInventoryUpdate';

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  orderId,
  currentStatus,
  onStatusUpdated
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const { reduceInventoryAsync, isUpdating: isReducingInventory } = useInventoryUpdate();

  const handleStatusUpdate = async () => {
    console.log('🔥 === BUTTON CLICKED - STARTING STATUS UPDATE ===');
    console.log('Order ID:', orderId);
    console.log('Current status:', currentStatus);
    console.log('Selected status:', selectedStatus);
    
    if (selectedStatus === currentStatus) {
      toast.info('Status is already set to ' + selectedStatus);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      console.log('Step 1: Updating order status in database...');
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Error updating order status:', updateError);
        throw updateError;
      }

      console.log('✅ Step 1 Complete: Order status updated successfully');

      // Handle inventory reduction when order is delivered (but only if coming from non-delivered status)
      if (selectedStatus === 'delivered' && currentStatus !== 'delivered') {
        console.log('📦 Step 1.5: Order marked as delivered - reducing inventory...');
        console.log('Calling reduceInventoryAsync with orderId:', orderId);
        
        try {
          const result = await reduceInventoryAsync({ orderId });
          console.log('📊 Inventory reduction result:', result);
          console.log('✅ Inventory successfully reduced for delivered order');
          toast.success('Inventory reduced successfully for delivered order');
        } catch (inventoryError) {
          console.error('⚠️ Inventory reduction failed:', inventoryError);
          toast.error('Status updated but inventory reduction failed. Please check inventory manually.');
          // Don't throw here - we still want to proceed with notifications
        }
      }

      // Handle email notifications
      if (selectedStatus === 'delivered') {
        console.log('🚀 Step 2: Triggering delivery notification...');
        
        try {
          const functionResponse = await supabase.functions.invoke('send-delivery-notification', {
            body: { orderId: orderId }
          });

          if (functionResponse.error) {
            console.error('❌ Delivery notification error:', functionResponse.error);
            toast.error(`Status updated but delivery notification failed: ${functionResponse.error.message}`);
          } else if (functionResponse.data?.success) {
            console.log('✅ Delivery notification sent successfully');
            toast.success(`Order status updated to ${selectedStatus}, inventory reduced, and delivery notification sent!`);
          } else {
            console.error('❌ Delivery notification failed:', functionResponse.data);
            toast.error('Status updated but delivery notification failed');
          }
        } catch (emailErr: any) {
          console.error('❌ Delivery email error:', emailErr);
          toast.error(`Status updated but delivery notification failed: ${emailErr.message}`);
        }
      } else if (selectedStatus === 'processing') {
        console.log('🚀 Step 2: Triggering order confirmation...');
        
        try {
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
            body: { 
              orderId: orderId,
              orderStatus: selectedStatus
            }
          });

          if (emailError) {
            console.error('❌ Order confirmation error:', emailError);
            toast.error('Status updated but confirmation email failed');
          } else {
            console.log('✅ Order confirmation sent successfully');
            toast.success(`Order status updated to ${selectedStatus} and confirmation sent!`);
          }
        } catch (emailErr) {
          console.error('❌ Email sending error:', emailErr);
          toast.error('Status updated but email notification failed');
        }
      } else {
        console.log('📧 No email notification needed for status:', selectedStatus);
        toast.success(`Order status updated to ${selectedStatus}`);
      }

      console.log('🔄 Step 3: Refreshing order data...');
      // Force refresh by calling the callback and wait for it
      await onStatusUpdated();
      console.log('✅ STATUS UPDATE PROCESS COMPLETE');

    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in handleStatusUpdate:', error);
      toast.error(`Failed to update order status: ${error.message}`);
      // Reset selectedStatus to currentStatus on error
      setSelectedStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't automatically reset selectedStatus when currentStatus changes during updates
  React.useEffect(() => {
    if (!isUpdating && !isReducingInventory) {
      setSelectedStatus(currentStatus);
    }
  }, [currentStatus, isUpdating, isReducingInventory]);

  const isButtonDisabled = isUpdating || isReducingInventory || selectedStatus === currentStatus;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processing': return 'Processing';
      case 'dispatched': return 'Dispatched';
      case 'delivered': return 'Delivered';
      case 'returned': return 'Returned';
      default: return status;
    }
  };

  return (
    <Card className="bg-darker border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold text-sm">Update Order Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-300">
            Current: <span className="text-gold font-semibold capitalize">{getStatusLabel(currentStatus)}</span>
          </label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isUpdating || isReducingInventory}>
            <SelectTrigger className="bg-dark border-gold/30 text-white">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent className="bg-dark border-gold/30">
              <SelectItem value="processing" className="text-white hover:bg-gold/20">
                Processing
              </SelectItem>
              <SelectItem value="dispatched" className="text-white hover:bg-gold/20">
                Dispatched
              </SelectItem>
              <SelectItem value="delivered" className="text-white hover:bg-gold/20">
                Delivered
              </SelectItem>
              <SelectItem value="returned" className="text-white hover:bg-gold/20">
                Returned
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleStatusUpdate}
          disabled={isButtonDisabled}
          className="w-full bg-gold text-darker hover:bg-gold/90 disabled:opacity-50 font-medium"
        >
          {isUpdating ? 'Updating Status...' : 
           isReducingInventory ? 'Processing Inventory...' : 
           selectedStatus === currentStatus ? `Already ${getStatusLabel(selectedStatus)}` :
           `Change to ${getStatusLabel(selectedStatus)}`}
        </Button>

        {selectedStatus !== currentStatus && (
          <p className="text-xs text-gray-400 text-center">
            This will change the order from "{getStatusLabel(currentStatus)}" to "{getStatusLabel(selectedStatus)}"
            {selectedStatus === 'delivered' && currentStatus !== 'delivered' && (
              <span className="text-yellow-400"> and reduce inventory</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderStatusManager;
