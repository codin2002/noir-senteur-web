
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CartItemType } from '@/components/cart/CartItem';
import AddressSelection from './AddressSelection';
import OrderSummary from './OrderSummary';
import CheckoutActions from './CheckoutActions';
import { useCheckout } from '@/hooks/useCheckout';

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
  const [deliveryAddress, setDeliveryAddress] = useState(userAddress || '');
  const { processPayment, isLoading } = useCheckout();

  const handleAddressChange = (address: string) => {
    setDeliveryAddress(address);
  };

  const handleCheckout = async () => {
    await processPayment(cartItems, deliveryAddress);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl mt-8 bg-darker border border-gold/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold">Complete Your Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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
};

export default CheckoutModal;
