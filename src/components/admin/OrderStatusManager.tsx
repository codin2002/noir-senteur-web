
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
  const { reduceInventory, isUpdating: isReducingInventory } = useInventoryUpdate();

  const handleStatusUpdate = async () => {
    console.log('🔥 === BUTTON CLICKED - STARTING STATUS UPDATE ===');
    console.log('Order ID:', orderId);
    console.log('Current status:', currentStatus);
    console.log('Selected status:', selectedStatus);
    
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

      // Handle inventory reduction when order is delivered
      if (selectedStatus === 'delivered' && currentStatus !== 'delivered') {
        console.log('📦 Step 1.5: Order marked as delivered - reducing inventory...');
        try {
          // Use Promise to properly wait for inventory reduction
          await new Promise<void>((resolve, reject) => {
            reduceInventory({ orderId }, {
              onSuccess: () => {
                console.log('✅ Inventory reduction completed successfully');
                resolve();
              },
              onError: (error) => {
                console.error('❌ Inventory reduction failed:', error);
                reject(error);
              }
            });
          });
        } catch (inventoryError) {
          console.error('⚠️ Inventory reduction failed:', inventoryError);
          toast.error('Status updated but inventory reduction failed');
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
            toast.success(`Order status updated to ${selectedStatus} and delivery notification sent!`);
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
      // Force refresh by calling the callback
      await onStatusUpdated();
      console.log('✅ STATUS UPDATE PROCESS COMPLETE');

    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in handleStatusUpdate:', error);
      toast.error(`Failed to update order status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const isButtonDisabled = isUpdating || isReducingInventory;

  return (
    <Card className="bg-darker border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold">Update Order Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Current Status: {currentStatus}</label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="bg-dark border-gold/30">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent className="bg-dark border-gold/30">
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleStatusUpdate}
          disabled={isButtonDisabled}
          className="w-full bg-gold text-darker hover:bg-gold/90"
        >
          {isUpdating ? 'Updating...' : isReducingInventory ? 'Updating Inventory...' : `Update to ${selectedStatus}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderStatusManager;
