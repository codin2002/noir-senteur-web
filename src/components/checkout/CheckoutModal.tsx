
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
  const [showGuestForm, setShowGuestForm] = useState(true);
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
      setShowGuestForm(false);
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  // If user is authenticated, show the regular checkout flow
  if (user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-darker border border-gold/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-gold">Complete Your Order</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review your order details and provide delivery information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pb-4">
            <OrderSummary cartItems={cartItems} currencySymbol={currencySymbol} />

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
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show guest checkout form for non-authenticated users
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-darker border border-gold/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold">Complete Your Order</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how you'd like to checkout - as a guest or with your account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pb-4">
          <OrderSummary cartItems={cartItems} currencySymbol={currencySymbol} />

          {showGuestForm ? (
            <GuestCheckoutForm
              onGuestCheckout={handleGuestCheckout}
              onSwitchToSignIn={handleSignInWithGoogle}
              isLoading={isLoading}
            />
          ) : (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
