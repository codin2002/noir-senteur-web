
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
      console.log(`=== STARTING STATUS UPDATE ===`);
      console.log(`Order ID: ${orderId}`);
      console.log(`Current Status: ${currentStatus}`);
      console.log(`New Status: ${selectedStatus}`);

      // Update order status in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw updateError;
      }

      console.log('✅ Order status updated successfully in database');

      // Send email notification for specific statuses
      if (selectedStatus === 'delivered') {
        console.log('🚀 Triggering delivery notification email...');
        console.log('Function URL being called:', `${supabase.supabaseUrl}/functions/v1/send-delivery-notification`);
        
        try {
          const functionResponse = await supabase.functions.invoke('send-delivery-notification', {
            body: JSON.stringify({ 
              orderId: orderId
            }),
            headers: {
              'Content-Type': 'application/json',
            }
          });

          console.log('📧 Function invocation complete');
          console.log('Response data:', functionResponse.data);
          console.log('Response error:', functionResponse.error);

          if (functionResponse.error) {
            console.error('❌ Function invocation error:', functionResponse.error);
            throw new Error(`Function error: ${JSON.stringify(functionResponse.error)}`);
          }

          if (functionResponse.data && functionResponse.data.success) {
            console.log('✅ Delivery notification sent successfully');
            toast.success(`Order status updated to ${selectedStatus} and delivery notification sent!`);
          } else {
            console.error('❌ Function returned unsuccessful response:', functionResponse.data);
            toast.error('Status updated but delivery notification failed');
          }
        } catch (emailErr: any) {
          console.error('❌ Delivery email error:', emailErr);
          console.error('Error details:', {
            message: emailErr.message,
            stack: emailErr.stack,
            name: emailErr.name
          });
          toast.error(`Status updated but delivery notification failed: ${emailErr.message}`);
        }
      } else if (selectedStatus === 'processing') {
        console.log('🚀 Triggering order confirmation email...');
        
        try {
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
            body: { 
              orderId: orderId,
              orderStatus: 'processing'
            }
          });

          console.log('Processing email function result:', emailResult);

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
        toast.success(`Order status updated to ${selectedStatus}`);
      }

      onStatusUpdated();
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
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
