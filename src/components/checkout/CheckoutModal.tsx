
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import AddressSelection from './AddressSelection';
import OrderSummary from './OrderSummary';
import { useCheckout } from '@/hooks/useCheckout';
import { toast } from 'sonner';
import { PRICING, OFFERS, getCartSubtotal, isSignatureDuoCart } from '@/utils/constants';
import { CheckoutDetails, emptyCheckoutDetails } from '@/utils/checkoutDetails';
import { useCheckoutDraft } from '@/hooks/useCheckoutDraft';

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
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>(() => emptyCheckoutDetails());
  const { processPayment, isLoading } = useCheckout();
  const offerId = isSignatureDuoCart(cartItems) ? OFFERS.SIGNATURE_DUO.ID : undefined;
  const { draftToken } = useCheckoutDraft(cartItems, checkoutDetails, offerId, isOpen);

  const calculateTotal = () => {
    const subtotal = getCartSubtotal(cartItems);
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Free shipping above the threshold, otherwise apply shipping cost
    const shippingCost = subtotal > 0 && totalQuantity < PRICING.FREE_SHIPPING_THRESHOLD ? PRICING.SHIPPING_COST : 0;
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

    await processPayment(cartItems, selectedAddress, {
      offerId,
      reminderConsent: false,
      draftToken,
    });
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
              onDetailsChange={setCheckoutDetails}
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
                className="w-full min-h-11 h-auto whitespace-normal bg-gold px-3 py-3 text-center leading-tight text-dark hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <span>Continue to secure payment <span className="whitespace-nowrap">· AED {calculateTotal().toFixed(2)}</span></span>
                )}
              </Button>
              <div className="mt-3 space-y-1 text-center text-xs text-white/55">
                <p className="flex items-center justify-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-gold" />Card, Apple Pay or Google Pay</p>
                <p className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-green-300" />Secure payment powered by Ziina</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
