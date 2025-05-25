
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItemType } from '@/components/cart/CartItem';
import AddressSelection from './AddressSelection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Declare Stripe types
declare global {
  interface Window {
    Stripe: any;
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemType[];
  userAddress: string;
  onConfirmCheckout: (addressType: 'home' | 'pickup', deliveryAddress: string, pickupPointId?: string) => void;
  currencySymbol: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  userAddress,
  onConfirmCheckout,
  currencySymbol
}) => {
  const [selectedAddressType, setSelectedAddressType] = useState<'home' | 'pickup'>('home');
  const [deliveryAddress, setDeliveryAddress] = useState(userAddress);
  const [pickupPointId, setPickupPointId] = useState<string>();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [stripeEmbeddedCheckout, setStripeEmbeddedCheckout] = useState<any>(null);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);

  // Load Stripe script
  useEffect(() => {
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleAddressChange = (addressType: 'home' | 'pickup', address: string, pointId?: string) => {
    setSelectedAddressType(addressType);
    setDeliveryAddress(address);
    setPickupPointId(pointId);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => 
      sum + (item.perfume.price_value * item.quantity), 0
    );
  };

  const subtotal = calculateSubtotal();
  const shippingCost = selectedAddressType === 'home' ? 20 : 0;
  const total = subtotal + shippingCost;

  const handleConfirmCheckout = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Create Stripe payment session with embedded checkout
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          cartItems,
          deliveryMethod: selectedAddressType,
          deliveryAddress,
          pickupPointId,
          embedded: true // Flag for embedded checkout
        }
      });

      if (error) throw error;

      if (data?.clientSecret && window.Stripe) {
        const stripe = window.Stripe(data.publishableKey);
        
        // Create embedded checkout
        const embeddedCheckout = await stripe.initEmbeddedCheckout({
          clientSecret: data.clientSecret,
        });

        setStripeEmbeddedCheckout(embeddedCheckout);
        setShowStripeCheckout(true);

        // Mount the embedded checkout
        setTimeout(() => {
          embeddedCheckout.mount('#embedded-checkout');
        }, 100);

        toast.success('Loading payment form...');
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: error.message || 'Unable to process payment. Please try again.'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBackToCheckout = () => {
    if (stripeEmbeddedCheckout) {
      stripeEmbeddedCheckout.destroy();
    }
    setShowStripeCheckout(false);
    setStripeEmbeddedCheckout(null);
  };

  const isAddressValid = selectedAddressType === 'home' ? !!userAddress : !!pickupPointId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-darker border-gold/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">
            {showStripeCheckout ? 'Complete Payment' : 'Checkout'}
          </DialogTitle>
        </DialogHeader>

        {showStripeCheckout ? (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="border-gold/30 hover:bg-gold/10"
              onClick={handleBackToCheckout}
            >
              ← Back to Checkout
            </Button>
            
            {/* Stripe Embedded Checkout will be mounted here */}
            <div id="embedded-checkout" className="min-h-[400px]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.perfume.name} × {item.quantity}</span>
                    <span>{currencySymbol}{(item.perfume.price_value * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="bg-gold/20" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({selectedAddressType === 'home' ? 'Home Delivery' : 'Pickup Point'})</span>
                  <span className={shippingCost === 0 ? 'text-green-400' : ''}>
                    {shippingCost === 0 ? 'FREE' : `${currencySymbol}${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <Separator className="bg-gold/20" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Address Selection */}
            <AddressSelection 
              userAddress={userAddress}
              onAddressChange={handleAddressChange}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-gold/30 hover:bg-gold/10"
                onClick={onClose}
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gold text-darker hover:bg-gold/80"
                onClick={handleConfirmCheckout}
                disabled={!isAddressValid || isProcessingPayment}
              >
                {isProcessingPayment ? 'Loading Payment...' : 'Continue to Payment'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
