
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
      console.log(`Updating order ${orderId} status from ${currentStatus} to ${selectedStatus}`);

      // Update order status in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw updateError;
      }

      console.log('Order status updated successfully');

      // Send email notification based on status
      if (selectedStatus === 'delivered') {
        console.log('Triggering delivery notification email...');
        
        try {
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-delivery-notification', {
            body: { orderId: orderId }
          });

          console.log('Email function result:', emailResult);

          if (emailError) {
            console.error('Error sending delivery notification:', emailError);
            toast.error('Status updated but delivery notification failed');
          } else {
            console.log('Delivery notification sent successfully');
            toast.success(`Order status updated to ${selectedStatus} and delivery notification sent!`);
          }
        } catch (emailErr) {
          console.error('Email sending error:', emailErr);
          toast.error('Status updated but email notification failed');
        }
      } else if (selectedStatus === 'processing') {
        console.log('Triggering order confirmation email...');
        
        try {
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
            body: { 
              orderId: orderId,
              orderStatus: selectedStatus 
            }
          });

          console.log('Email function result:', emailResult);

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
      console.error('Error updating order status:', error);
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
