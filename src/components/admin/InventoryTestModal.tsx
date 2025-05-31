
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventoryUpdate } from '@/hooks/useInventoryUpdate';
import { toast } from 'sonner';

interface InventoryTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryTestModal: React.FC<InventoryTestModalProps> = ({ isOpen, onClose }) => {
  const [testOrderId, setTestOrderId] = useState('');
  const { reduceInventory, isUpdating } = useInventoryUpdate();

  const handleTestInventory = () => {
    if (!testOrderId.trim()) {
      toast.error('Please enter an order ID to test');
      return;
    }

    console.log('Testing inventory reduction for order:', testOrderId);
    
    reduceInventory({ orderId: testOrderId.trim() });
    
    // Close modal after initiating test
    setTimeout(() => {
      onClose();
      setTestOrderId('');
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-darker border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-gold">Test Inventory Reduction</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-300">
            This will test the inventory reduction system by processing an existing order's items.
            Enter an order ID to simulate inventory reduction.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="orderId" className="text-gold">Order ID</Label>
            <Input
              id="orderId"
              value={testOrderId}
              onChange={(e) => setTestOrderId(e.target.value)}
              placeholder="Enter order ID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
              className="bg-dark border-gold/30"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTestInventory}
              disabled={isUpdating || !testOrderId.trim()}
              className="bg-gold text-darker hover:bg-gold/90"
            >
              {isUpdating ? 'Testing...' : 'Test Inventory'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryTestModal;
