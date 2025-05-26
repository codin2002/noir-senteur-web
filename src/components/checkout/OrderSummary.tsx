
import React from 'react';
import { CartItemType } from '@/components/cart/CartItem';

interface OrderSummaryProps {
  cartItems: CartItemType[];
  currencySymbol: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  currencySymbol
}) => {
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.perfume.price_value * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 1;
  const total = subtotal + shipping;

  return (
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
  );
};

export default OrderSummary;
