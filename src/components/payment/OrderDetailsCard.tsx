
import React from 'react';
import { Package } from 'lucide-react';
import { getPerfumeDisplayName } from '@/utils/constants';

interface OrderDetailsCardProps {
  orderDetails: any;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ orderDetails }) => {
  if (!orderDetails) return null;
  const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];

  return (
    <div className="bg-darker border border-gold/20 rounded-lg p-8 mb-8 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Package className="w-5 h-5 mr-2 text-gold" />
            Order Details
          </h3>
          <p className="text-muted-foreground mb-1">
            Order ID: #{orderDetails.orderId?.substring(0, 8)}
          </p>
          <p className="text-muted-foreground mb-1">
            Payment Method: {orderDetails.paymentMethod || 'Ziina'}
          </p>
          <p className="text-muted-foreground">
            Delivery: {orderDetails.deliveryMethod || 'Home Delivery'}
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Delivery Information</h3>
          <p className="text-muted-foreground text-sm">
            {orderDetails.deliveryAddress || 'Address on file'}
          </p>
        </div>
      </div>
      {items.length > 0 && (
        <div className="mt-6 border-t border-gold/20 pt-5 text-left">
          <h3 className="text-lg font-semibold mb-4">Your items</h3>
          <div className="space-y-3">
            {items.map((item: any) => (
              <div key={item.id || item.perfume_id} className="flex items-center gap-4 rounded-md bg-dark/50 p-3">
                {item.perfume?.image && (
                  <img src={item.perfume.image} alt={getPerfumeDisplayName(item.perfume)} className="h-16 w-16 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{item.perfume ? getPerfumeDisplayName(item.perfume) : 'Perfume'}</p>
                  <p className="text-sm text-muted-foreground">100 ml · Quantity: {item.quantity}</p>
                </div>
                <p className="text-sm text-gold">AED {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
              </div>
            ))}
          </div>
          {orderDetails.total != null && (
            <p className="mt-4 text-right text-lg font-semibold text-gold">Total: AED {Number(orderDetails.total).toFixed(2)}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetailsCard;
