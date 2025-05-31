
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';

interface OrderReturnManagerProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const OrderReturnManager: React.FC<OrderReturnManagerProps> = ({
  orderId,
  currentStatus,
  onStatusUpdated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReturn = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a return reason');
      return;
    }

    setIsProcessing(true);
    try {
      // Update order status to returned and add return reason to notes
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'returned',
          notes: `Return Reason: ${returnReason}`
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order marked as returned');
      setIsOpen(false);
      setReturnReason('');
      onStatusUpdated();
    } catch (error: any) {
      console.error('Error processing return:', error);
      toast.error(`Failed to process return: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't show return option for already returned orders
  if (currentStatus === 'returned') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Return
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-darker border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-gold">Process Order Return</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gold">
              Return Reason
            </label>
            <Textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Please provide a reason for the return..."
              className="bg-dark border-gold/30 min-h-[100px]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReturn}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isProcessing ? 'Processing...' : 'Process Return'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gold/30"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReturnManager;
