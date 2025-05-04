
import React from 'react';
import { Button } from '@/components/ui/button';
import { CartItemType } from './CartItem';

interface CartSummaryProps {
  cartItems: CartItemType[];
  onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ cartItems, onCheckout }) => {
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => 
      sum + (item.perfume.price_value * item.quantity), 0
    );
  };

  return (
    <div className="bg-darker border border-gold/20 rounded-lg p-6 h-fit">
      <h2 className="text-xl font-serif mb-6">Order Summary</h2>
      
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.perfume.name} × {item.quantity}</span>
            <span>${item.perfume.price_value * item.quantity}</span>
          </div>
        ))}
        
        <div className="border-t border-gold/20 pt-3 mt-3">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span className="text-gold">${calculateTotal()}</span>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-gold text-darker hover:bg-gold/80 mt-6"
        onClick={onCheckout}
      >
        Checkout
      </Button>
    </div>
  );
};

export default CartSummary;
