
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CheckoutActionsProps {
  onCancel: () => void;
  onCheckout: () => void;
  isProcessing: boolean;
  isCheckoutDisabled: boolean;
}

const CheckoutActions: React.FC<CheckoutActionsProps> = ({
  onCancel,
  onCheckout,
  isProcessing,
  isCheckoutDisabled
}) => {
  return (
    <div className="flex gap-3">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="flex-1 border-gold/30 hover:bg-gold/10"
        disabled={isProcessing}
      >
        Cancel
      </Button>
      <Button 
        onClick={onCheckout}
        disabled={isProcessing || isCheckoutDisabled}
        className="flex-1 bg-gold text-darker hover:bg-gold/80"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay with Ziina'
        )}
      </Button>
    </div>
  );
};

export default CheckoutActions;
