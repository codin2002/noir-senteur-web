
import React from 'react';
import { Package } from 'lucide-react';
import { getPerfumeDisplayName, OFFERS } from '@/utils/constants';

interface OrderDetailsCardProps {
  orderDetails: any;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ orderDetails }) => {
  if (!orderDetails) return null;
  const orderReference = orderDetails.orderId
    ? `SEN-${String(orderDetails.orderId).slice(0, 8).toUpperCase()}`
    : null;
  const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];
  const duoProductIds = OFFERS.SIGNATURE_DUO.PRODUCT_IDS;
  const duoItems = duoProductIds.map((productId) => items.find((item: any) => item.perfume_id === productId));
  const duoQuantity = Math.min(...duoItems.map((item: any) => Number(item?.quantity || 0)));
  const regularSubtotal = items.reduce(
    (sum: number, item: any) => sum + Number(item?.perfume?.price_value || 0) * Number(item?.quantity || 0),
    0,
  );
  const expectedDuoSaving = duoQuantity * OFFERS.SIGNATURE_DUO.SAVINGS;
  const hasSignatureDuo = duoQuantity > 0
    && Math.abs(regularSubtotal - Number(orderDetails.total) - expectedDuoSaving) < 0.02;
  const remainingItems = items.flatMap((item: any) => {
    const reservedQuantity = hasSignatureDuo && duoProductIds.includes(item.perfume_id) ? duoQuantity : 0;
    const quantity = Number(item.quantity || 0) - reservedQuantity;
    return quantity > 0 ? [{ ...item, quantity, displayPrice: Number(item.perfume?.price_value || item.price) * quantity }] : [];
  });

  return (
    <div className="bg-darker border border-gold/20 rounded-lg p-8 mb-8 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Package className="w-5 h-5 mr-2 text-gold" />
            Order Details
          </h3>
          <p className="text-muted-foreground mb-1">
            Order reference: <span className="font-medium text-white">{orderReference}</span>
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
            {hasSignatureDuo && (
              <div className="flex items-center gap-4 rounded-md border border-gold/30 bg-dark/50 p-3">
                <img src="/images/signature-duo-together.png" alt="The Signature Duo" className="h-16 w-16 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">The Signature Duo</p>
                  <p className="text-sm text-muted-foreground">313 + 424 · 2 × 100 ml{duoQuantity > 1 ? ` · Qty ${duoQuantity}` : ''}</p>
                  <p className="mt-1 text-xs text-green-300">You saved AED {(expectedDuoSaving).toFixed(2)}</p>
                </div>
                <p className="text-sm text-gold">AED {(OFFERS.SIGNATURE_DUO.PRICE * duoQuantity).toFixed(2)}</p>
              </div>
            )}
            {remainingItems.map((item: any) => (
              <div key={item.id || item.perfume_id} className="flex items-center gap-4 rounded-md bg-dark/50 p-3">
                {item.perfume?.image && (
                  <img src={item.perfume.image} alt={getPerfumeDisplayName(item.perfume)} className="h-16 w-16 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{item.perfume ? getPerfumeDisplayName(item.perfume) : 'Perfume'}</p>
                  <p className="text-sm text-muted-foreground">100 ml · Quantity: {item.quantity}</p>
                </div>
                <p className="text-sm text-gold">AED {Number(item.displayPrice ?? Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
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
