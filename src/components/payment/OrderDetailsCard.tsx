
import React from 'react';
import { Package } from 'lucide-react';

interface OrderDetailsCardProps {
  orderDetails: any;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ orderDetails }) => {
  if (!orderDetails) return null;

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
    </div>
  );
};

export default OrderDetailsCard;
