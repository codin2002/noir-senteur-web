import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Home, Building2 } from 'lucide-react';
import { CartItemType } from '@/components/cart/CartItem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import AddressSelection from './AddressSelection';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemType[];
  userAddress: string;
  onConfirmCheckout: (addressType: 'home', deliveryAddress: string) => Promise<void>;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(userAddress || '');
  const { user, session } = useAuth();

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.perfume.price_value * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 1;
  const total = subtotal + shipping;

  const handleAddressChange = (addressType: 'home', address: string) => {
    setDeliveryAddress(address);
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    if (!user || !session) {
      toast.error('Please sign in to continue');
      return;
    }

    console.log('Starting checkout process...');
    console.log('User:', user.id, user.email);
    console.log('Session exists:', !!session);
    console.log('Cart items:', cartItems);
    console.log('Delivery address:', deliveryAddress);
    console.log('Total amount:', total);

    setIsProcessing(true);
    
    try {
      // Store payment info in localStorage for later verification
      const paymentInfo = {
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.full_name || user.email,
        cartItems: cartItems.map(item => ({
          perfume_id: item.perfume.id,
          quantity: item.quantity,
          price: item.perfume.price_value
        })),
        deliveryAddress,
        totalAmount: total,
        timestamp: Date.now()
      };
      
      console.log('Storing payment info in localStorage:', paymentInfo);
      localStorage.setItem('ziina_payment_info', JSON.stringify(paymentInfo));

      console.log('Calling create-payment function...');
      
      // Use the current session's access token directly
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          cartItems,
          deliveryAddress
        }
      });

      console.log('Create-payment response:', { data, error });

      if (error) {
        console.error('Payment creation error:', error);
        throw error;
      }

      if (data?.success && data?.payment_url) {
        console.log('Payment URL received:', data.payment_url);
        console.log('Payment ID:', data.payment_id);
        
        // Update stored payment info with payment ID
        const updatedPaymentInfo = {
          ...paymentInfo,
          paymentId: data.payment_id
        };
        localStorage.setItem('ziina_payment_info', JSON.stringify(updatedPaymentInfo));
        
        toast.success('Redirecting to payment...', {
          description: 'You will be redirected to complete your payment.'
        });
        
        console.log('Opening payment URL in current window...');
        // Open payment URL in current window instead of new tab
        window.location.href = data.payment_url;
      } else {
        console.error('Invalid payment response:', data);
        throw new Error('Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Payment failed', {
        description: error.message || 'Unable to process payment. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-darker border border-gold/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold">Complete Your Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-medium">Order Summary</h3>
            <div className="bg-dark border border-gold/10 rounded-lg p-4 space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.perfume.name} × {item.quantity}</span>
                  <span>{currencySymbol}{(item.perfume.price_value * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gold/20 pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{currencySymbol}{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-gold">
                  <span>Total</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Selection */}
          <AddressSelection
            userAddress={userAddress}
            onAddressChange={handleAddressChange}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-gold/30 hover:bg-gold/10"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={isProcessing || !deliveryAddress.trim()}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
