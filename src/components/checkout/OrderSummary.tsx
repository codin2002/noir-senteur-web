
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CartItemType } from '@/components/cart/CartItem';
import { Package2, Truck } from 'lucide-react';

interface OrderSummaryProps {
  cartItems: CartItemType[];
  currencySymbol: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, currencySymbol }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.perfume.price_value * item.quantity), 0);
  const shipping = 1;
  const total = subtotal + shipping;

  return (
    <div className="bg-darker/80 border border-gold/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <Package2 className="w-5 h-5 text-gold" />
        <h3 className="text-xl font-serif text-gold">Order Summary</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3 border-b border-gold/10 last:border-b-0">
            <div className="flex items-center space-x-3">
              <img
                src={item.perfume.image}
                alt={item.perfume.name}
                className="w-12 h-12 object-cover rounded-lg border border-gold/20"
              />
              <div className="flex-1">
                <p className="font-medium text-white text-sm leading-tight">{item.perfume.name}</p>
                <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="font-semibold text-gold text-sm">
              {currencySymbol}{(item.perfume.price_value * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="bg-gold/20 mb-4" />
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-white font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Shipping</span>
          </div>
          <span className="text-white font-medium">{currencySymbol}{shipping.toFixed(2)}</span>
        </div>
        
        <Separator className="bg-gold/20" />
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-serif text-gold">Total</span>
          <span className="text-xl font-bold text-gold">{currencySymbol}{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
