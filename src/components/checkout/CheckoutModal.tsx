
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CartItemType } from '@/components/cart/CartItem';
import AddressSelection from './AddressSelection';
import OrderSummary from './OrderSummary';
import CheckoutActions from './CheckoutActions';
import GuestCheckoutForm from './GuestCheckoutForm';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemType[];
  userAddress: string;
  onConfirmCheckout: (addressType: 'home', deliveryAddress: string) => Promise<void>;
  currencySymbol: string;
}

interface GuestDetails {
  name: string;
  email: string;
  phoneNumber: string;
  buildingName: string;
  floorNumber: string;
  roomNumber: string;
  area: string;
  landmark: string;
  emirate: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  userAddress,
  onConfirmCheckout,
  currencySymbol
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState(userAddress || '');
  const [showUserCheckout, setShowUserCheckout] = useState(false);
  const { processPayment, isLoading } = useCheckout();
  const { user, signInWithGoogle } = useAuth();

  const handleAddressChange = (address: string) => {
    setDeliveryAddress(address);
  };

  const handleCheckout = async () => {
    await processPayment(cartItems, deliveryAddress);
  };

  const handleGuestCheckout = async (guestDetails: GuestDetails) => {
    // Format the guest address for payment processing
    const addressParts = [
      guestDetails.buildingName,
      guestDetails.floorNumber,
      guestDetails.roomNumber,
      guestDetails.area,
      guestDetails.landmark,
      guestDetails.emirate
    ].filter(Boolean);
    
    const guestAddress = `${addressParts.join(', ')} | Contact: ${guestDetails.name} | Email: ${guestDetails.email} | Phone: ${guestDetails.phoneNumber}`;
    
    await processPayment(cartItems, guestAddress);
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
      setShowUserCheckout(true);
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-darker border border-gold/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold">Complete Your Order</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {(user || showUserCheckout) ? "Review your order details and provide delivery information." : "Choose how you'd like to checkout"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pb-4">
          <OrderSummary cartItems={cartItems} currencySymbol={currencySymbol} />

          {(user || showUserCheckout) ? (
            <>
              <AddressSelection
                onAddressChange={handleAddressChange}
                selectedAddress={deliveryAddress}
              />

              <CheckoutActions
                onCancel={onClose}
                onCheckout={handleCheckout}
                isProcessing={isLoading}
                isCheckoutDisabled={!deliveryAddress.trim()}
              />
            </>
          ) : (
            <GuestCheckoutForm
              onGuestCheckout={handleGuestCheckout}
              onSwitchToSignIn={handleSignInWithGoogle}
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
