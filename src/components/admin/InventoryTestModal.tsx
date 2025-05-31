
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const { testInventoryReduction, isUpdating } = useInventoryUpdate();

  const handleTestInventory = async () => {
    if (!testOrderId.trim()) {
      toast.error('Please enter an order ID to test');
      return;
    }

    console.log('🧪 Testing inventory reduction for order:', testOrderId);
    
    try {
      await testInventoryReduction(testOrderId.trim());
      toast.success('Inventory test completed successfully!');
      
      // Close modal after successful test
      setTimeout(() => {
        onClose();
        setTestOrderId('');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Inventory test failed:', error);
      toast.error(`Inventory test failed: ${error.message}`);
    }
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
            Enter an order ID to simulate inventory reduction for delivered orders.
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
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-amber-400 text-sm">
              <strong>Note:</strong> This will actually reduce inventory counts. Only use with real order IDs that should have their inventory reduced.
            </p>
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
              {isUpdating ? 'Testing...' : 'Test Inventory Reduction'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryTestModal;
