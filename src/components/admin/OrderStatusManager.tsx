
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  // Add debugging when component mounts or currentStatus changes
  React.useEffect(() => {
    console.log('🔍 OrderStatusManager DEBUG INFO:');
    console.log('Order ID:', orderId);
    console.log('Current Status Prop:', currentStatus);
    console.log('Current Status Type:', typeof currentStatus);
    console.log('Current Status Length:', currentStatus?.length);
    console.log('Current Status Chars:', Array.from(currentStatus || '').map(c => `'${c}' (${c.charCodeAt(0)})`));
    
    // Fetch raw order data to see what's actually in the database
    const fetchRawOrderData = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, user_id, guest_name')
          .eq('id', orderId)
          .single();
        
        console.log('🔍 RAW DATABASE DATA for order:', orderId);
        console.log('Raw order data:', data);
        console.log('Raw status:', data?.status);
        console.log('Raw status type:', typeof data?.status);
        console.log('Raw status chars:', Array.from(data?.status || '').map(c => `'${c}' (${c.charCodeAt(0)})`));
        console.log('Database error:', error);
      } catch (err) {
        console.error('Failed to fetch raw order data:', err);
      }
    };
    
    fetchRawOrderData();
  }, [orderId, currentStatus]);

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
      console.log('About to execute update query with:', { orderId, selectedStatus });
      
      const { data: updateData, error: updateError } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', orderId)
        .select(); // Add select to see what was actually updated

      console.log('Update query result:', { updateData, updateError });

      if (updateError) {
        console.error('❌ Error updating order status:', updateError);
        throw updateError;
      }

      if (!updateData || updateData.length === 0) {
        console.error('❌ No rows were updated - order might not exist');
        throw new Error('No order was updated. Order might not exist.');
      }

      console.log('✅ Step 1 Complete: Order status updated successfully');
      console.log('Updated order data:', updateData[0]);

      // Verify the update by fetching the order again
      console.log('🔍 Verifying update by fetching order...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId)
        .single();

      if (verifyError) {
        console.error('❌ Error verifying update:', verifyError);
      } else {
        console.log('✅ Verification result:', verifyData);
        if (verifyData.status !== selectedStatus) {
          console.error('❌ CRITICAL: Status not updated in database!', {
            expected: selectedStatus,
            actual: verifyData.status
          });
          throw new Error(`Status update failed. Expected: ${selectedStatus}, Actual: ${verifyData.status}`);
        }
      }

      // Note: Inventory is now reduced during order placement, not delivery
      if (selectedStatus === 'delivered') {
        console.log('📦 Order marked as delivered - inventory was already reduced during order placement');
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

      console.log('🔄 Step 3: Force refreshing all order data with extended delays...');
      
      // Wait longer before first refresh to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      await onStatusUpdated();
      
      // Additional refresh after longer delay
      setTimeout(async () => {
        console.log('🔄 Secondary refresh after extended database sync...');
        await onStatusUpdated();
      }, 3000);
      
      // Final refresh with even longer delay
      setTimeout(async () => {
        console.log('🔄 Final refresh to ensure complete database propagation...');
        await onStatusUpdated();
      }, 6000);
      
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
    if (!isUpdating) {
      setSelectedStatus(currentStatus);
    }
  }, [currentStatus, isUpdating]);

  const isButtonDisabled = isUpdating || selectedStatus === currentStatus;

  const getStatusLabel = (status: string) => {
    console.log('🏷️ Getting status label for:', status, 'Type:', typeof status);
    switch (status) {
      case 'processing': return 'Processing';
      case 'dispatched': return 'Dispatched';
      case 'delivered': return 'Delivered';
      case 'returned': return 'Returned';
      default: 
        console.warn('⚠️ Unknown status encountered:', status);
        return status;
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
          <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isUpdating}>
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
           selectedStatus === currentStatus ? `Already ${getStatusLabel(selectedStatus)}` :
           `Change to ${getStatusLabel(selectedStatus)}`}
        </Button>

        {selectedStatus !== currentStatus && (
          <p className="text-xs text-gray-400 text-center">
            This will change the order from "{getStatusLabel(currentStatus)}" to "{getStatusLabel(selectedStatus)}"
            {selectedStatus === 'delivered' && (
              <span className="text-green-400"> (inventory was reduced when order was placed)</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderStatusManager;
