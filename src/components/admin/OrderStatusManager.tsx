
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

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      toast.error('Please select a different status');
      return;
    }

    setIsUpdating(true);
    try {
      console.log(`=== STARTING STATUS UPDATE PROCESS ===`);
      console.log(`Order ID: ${orderId}`);
      console.log(`Current Status: ${currentStatus}`);
      console.log(`New Status: ${selectedStatus}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);

      // Update order status in database
      console.log('Step 1: Updating order status in database...');
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Error updating order status:', updateError);
        throw updateError;
      }

      console.log('✅ Step 1 Complete: Order status updated successfully in database');

      // Handle email notifications based on status
      if (selectedStatus === 'delivered') {
        console.log('🚀 Step 2: Status is DELIVERED - triggering delivery notification...');
        console.log('Function name to invoke: send-delivery-notification');
        
        try {
          console.log('Preparing function payload...');
          const functionPayload = { 
            orderId: orderId
          };
          console.log('Function payload:', JSON.stringify(functionPayload, null, 2));

          console.log('Invoking Supabase function...');
          const functionResponse = await supabase.functions.invoke('send-delivery-notification', {
            body: functionPayload
          });

          console.log('📧 Function invocation response received');
          console.log('Response data:', JSON.stringify(functionResponse.data, null, 2));
          console.log('Response error:', JSON.stringify(functionResponse.error, null, 2));

          if (functionResponse.error) {
            console.error('❌ Function invocation error details:', {
              message: functionResponse.error.message,
              context: functionResponse.error.context,
              details: functionResponse.error.details
            });
            toast.error(`Status updated but delivery notification failed: ${functionResponse.error.message}`);
          } else if (functionResponse.data) {
            console.log('📧 Function returned data - checking success status...');
            if (functionResponse.data.success) {
              console.log('✅ Delivery notification sent successfully!');
              console.log('Email ID:', functionResponse.data.emailId);
              console.log('Recipient:', functionResponse.data.recipientEmail);
              toast.success(`Order status updated to ${selectedStatus} and delivery notification sent!`);
            } else if (functionResponse.data.alreadySent) {
              console.log('⚠️ Delivery notification was already sent');
              toast.success(`Order status updated to ${selectedStatus}. Delivery notification was already sent.`);
            } else {
              console.error('❌ Function returned unsuccessful response:', functionResponse.data);
              console.error('Error message from function:', functionResponse.data.error?.message);
              toast.error(`Status updated but delivery notification failed: ${functionResponse.data.error?.message || 'Unknown error'}`);
            }
          } else {
            console.error('❌ Function returned no data');
            toast.error('Status updated but delivery notification failed - no response data');
          }
        } catch (emailErr: any) {
          console.error('❌ DELIVERY EMAIL ERROR CAUGHT:', emailErr);
          console.error('Error name:', emailErr.name);
          console.error('Error message:', emailErr.message);
          console.error('Error stack:', emailErr.stack);
          console.error('Full error object:', JSON.stringify(emailErr, null, 2));
          toast.error(`Status updated but delivery notification failed: ${emailErr.message}`);
        }
      } else if (selectedStatus === 'processing') {
        console.log('🚀 Step 2: Status is PROCESSING - triggering order confirmation...');
        
        try {
          console.log('Invoking send-order-confirmation function...');
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
            body: { 
              orderId: orderId,
              orderStatus: 'processing'
            }
          });

          console.log('Processing email function result:', emailResult);
          console.log('Processing email function error:', emailError);

          if (emailError) {
            console.error('Error sending order confirmation:', emailError);
            toast.error('Status updated but confirmation email failed');
          } else {
            console.log('Order confirmation sent successfully');
            toast.success(`Order status updated to ${selectedStatus} and confirmation sent!`);
          }
        } catch (emailErr) {
          console.error('Email sending error:', emailErr);
          toast.error('Status updated but email notification failed');
        }
      } else {
        console.log('📧 Step 2: No email notification needed for status:', selectedStatus);
        toast.success(`Order status updated to ${selectedStatus}`);
      }

      console.log('🔄 Step 3: Refreshing order data...');
      onStatusUpdated();
      console.log('✅ STATUS UPDATE PROCESS COMPLETE');

    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in handleStatusUpdate:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast.error(`Failed to update order status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

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
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleStatusUpdate}
          disabled={isUpdating || selectedStatus === currentStatus}
          className="w-full bg-gold text-darker hover:bg-gold/90"
        >
          {isUpdating ? 'Updating...' : `Update to ${selectedStatus}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderStatusManager;
