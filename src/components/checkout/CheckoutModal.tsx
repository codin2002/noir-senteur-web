
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AddressSelection from './AddressSelection';
import OrderSummary from './OrderSummary';
import { useCheckout } from '@/hooks/useCheckout';
import { toast } from 'sonner';
import { PRICING } from '@/utils/constants';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  total: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  total
}) => {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(false);
  const { processPayment, isLoading } = useCheckout();

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.perfume.price_value * item.quantity), 0);
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Free shipping if 2 or more items, otherwise apply shipping cost
    const shippingCost = subtotal > 0 && totalQuantity < 2 ? PRICING.SHIPPING_COST : 0;
    return subtotal + shippingCost;
  };

  const handleCheckout = async () => {
    if (!selectedAddress.trim()) {
      toast.error('Please provide your delivery address');
      return;
    }

    if (!isAddressValid) {
      toast.error('Please provide your phone number');
      return;
    }

    await processPayment(cartItems, selectedAddress);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-darker border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-gold text-xl font-serif">Complete Your Order</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <AddressSelection 
              onAddressChange={setSelectedAddress}
              selectedAddress={selectedAddress}
              onValidationChange={setIsAddressValid}
            />
          </div>
          
          <div>
            <OrderSummary 
              cartItems={cartItems} 
              total={calculateTotal()}
              currencySymbol="AED "
            />
            
            <div className="mt-6">
              <Button
                onClick={handleCheckout}
                disabled={isLoading || !selectedAddress.trim() || !isAddressValid}
                className="w-full bg-gold text-dark hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
