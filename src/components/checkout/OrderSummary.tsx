
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CartItemType } from '@/components/cart/CartItem';
import { Package2, Truck, AlertTriangle } from 'lucide-react';
import { PRICING } from '@/utils/constants';

interface OrderSummaryProps {
  cartItems: CartItemType[];
  currencySymbol: string;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, currencySymbol, total }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.perfume.price_value * item.quantity), 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Free shipping if 2 or more items, otherwise apply shipping cost
  const shipping = subtotal > 0 && totalQuantity < 2 ? PRICING.SHIPPING_COST : 0;

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
          <span className="text-white font-medium">
            {shipping > 0 ? (
              `${currencySymbol}${shipping.toFixed(2)}`
            ) : (
              <span className="text-green-400">Free</span>
            )}
          </span>
        </div>
        
        {totalQuantity >= 2 && (
          <div className="text-xs text-green-400 text-center">
            🎉 Free shipping on 2+ items!
          </div>
        )}
        
        <Separator className="bg-gold/20" />
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-serif text-gold">Total (includes shipping)</span>
          <span className="text-xl font-bold text-gold">{currencySymbol}{total.toFixed(2)}</span>
        </div>
        
        <div className="flex items-start gap-2 mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300 leading-relaxed">
            <strong>NOTE:</strong> Kindly do not exit website until you are redirected to the payment confirmation page
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
