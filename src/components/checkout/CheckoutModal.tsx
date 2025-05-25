
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItemType } from '@/components/cart/CartItem';
import AddressSelection from './AddressSelection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const shippingCost = selectedAddressType === 'home' ? 20 : 0; // 20 AED for home delivery, free for pickup
  const total = subtotal + shippingCost;

  const handleConfirmCheckout = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Create Stripe payment session
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          cartItems,
          deliveryMethod: selectedAddressType,
          deliveryAddress,
          pickupPointId
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        // Call the original checkout handler for any cleanup
        onConfirmCheckout(selectedAddressType, deliveryAddress, pickupPointId);
        onClose();
        
        toast.success('Redirecting to payment...', {
          description: 'Complete your payment in the new tab to finish your order.'
        });
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

  const isAddressValid = selectedAddressType === 'home' ? !!userAddress : !!pickupPointId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-darker border-gold/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Checkout</DialogTitle>
        </DialogHeader>

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
              {isProcessingPayment ? 'Processing...' : 'Pay with Stripe'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
