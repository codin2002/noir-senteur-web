
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, User, Mail, Phone, MapPin } from 'lucide-react';
import { useOrderDetails } from '@/hooks/useOrderDetails';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  orderId
}) => {
  const { orderDetails, isLoading, fetchOrderDetails, clearOrderDetails } = useOrderDetails();

  React.useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails(orderId);
    } else {
      clearOrderDetails();
    }
  }, [isOpen, orderId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-darker border border-gold/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold">Order Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-dark border border-gold/10 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-gold" />
                    Order Information
                  </h3>
                  <p className="text-muted-foreground mb-1">
                    Order ID: #{orderDetails.id.substring(0, 8)}
                  </p>
                  <p className="text-muted-foreground mb-1">
                    Status: <Badge variant="secondary">{orderDetails.status}</Badge>
                  </p>
                  <p className="text-muted-foreground mb-1">
                    Date: {formatDate(orderDetails.created_at)}
                  </p>
                  <p className="text-lg font-semibold text-gold">
                    Total: AED {orderDetails.total.toFixed(2)}
                  </p>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gold" />
                    Customer Information
                  </h3>
                  {orderDetails.guest_name && (
                    <p className="text-muted-foreground mb-1 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {orderDetails.guest_name}
                    </p>
                  )}
                  {orderDetails.guest_email && (
                    <p className="text-muted-foreground mb-1 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {orderDetails.guest_email}
                    </p>
                  )}
                  {orderDetails.guest_phone && (
                    <p className="text-muted-foreground mb-1 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {orderDetails.guest_phone}
                    </p>
                  )}
                  {orderDetails.delivery_address && (
                    <p className="text-muted-foreground flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink-0" />
                      <span className="text-sm">{orderDetails.delivery_address}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="bg-dark border border-gold/10 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.perfume.image}
                        alt={item.perfume.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.perfume.name}</h4>
                        <p className="text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-muted-foreground">
                          Price: AED {item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gold">
                          AED {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Order details not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
