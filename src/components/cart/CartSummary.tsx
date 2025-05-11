
import React from 'react';
import { Button } from '@/components/ui/button';
import { CartItemType } from './CartItem';
import { PRICING } from '@/utils/constants';

interface CartSummaryProps {
  cartItems: CartItemType[];
  onCheckout: () => void;
  currencySymbol?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ 
  cartItems, 
  onCheckout, 
  currencySymbol = PRICING.CURRENCY_SYMBOL 
}) => {
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => 
      sum + (PRICING.PERFUME_PRICE * item.quantity), 0
    );
  };

  const subtotal = calculateSubtotal();
  const shippingCost = subtotal > 0 ? PRICING.SHIPPING_COST : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="bg-darker border border-gold/20 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-serif">Order Summary</h2>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Subtotal</span>
        <span>{currencySymbol}{subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Shipping</span>
        <span>{currencySymbol}{shippingCost.toFixed(2)}</span>
      </div>
      
      <div className="border-t border-gold/20 pt-4 flex justify-between font-medium">
        <span>Total</span>
        <span>{currencySymbol}{total.toFixed(2)}</span>
      </div>
      
      <Button 
        className="w-full bg-gold text-darker hover:bg-gold/80"
        onClick={onCheckout}
        disabled={cartItems.length === 0}
      >
        Checkout
      </Button>
    </div>
  );
};

export default CartSummary;
