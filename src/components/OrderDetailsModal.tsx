
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, User, Mail, Phone, MapPin } from 'lucide-react';
import { useOrderDetails } from '@/hooks/useOrderDetails';
import OrderStatusManager from '@/components/admin/OrderStatusManager';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  showAdmin?: boolean;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  orderId,
  showAdmin = false
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

  const handleStatusUpdated = () => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  };

  const getCustomerInfo = () => {
    if (orderDetails?.guest_name) {
      return {
        name: orderDetails.guest_name,
        email: orderDetails.guest_email || 'No email provided',
        phone: orderDetails.guest_phone || 'No phone provided'
      };
    }
    
    if (orderDetails?.parsed_delivery_info?.contactName) {
      return {
        name: orderDetails.parsed_delivery_info.contactName,
        email: orderDetails.parsed_delivery_info.email || 'No email provided',
        phone: orderDetails.parsed_delivery_info.phone || 'No phone provided'
      };
    }
    
    if (orderDetails?.user_profile?.full_name) {
      return {
        name: orderDetails.user_profile.full_name,
        email: 'Via user account',
        phone: orderDetails.user_profile.phone || 'Via user account'
      };
    }
    
    return {
      name: 'Registered User',
      email: 'Via user account',
      phone: 'Via user account'
    };
  };

  const getDeliveryAddress = () => {
    if (orderDetails?.parsed_delivery_info?.address) {
      return orderDetails.parsed_delivery_info.address;
    }
    return orderDetails?.delivery_address || 'Address on file';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-darker border border-gold/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold">Order Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            {/* Order Info and Admin Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-dark border border-gold/10 rounded-lg p-4">
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

              {/* Admin Status Manager */}
              {showAdmin && (
                <div>
                  <OrderStatusManager
                    orderId={orderDetails.id}
                    currentStatus={orderDetails.status}
                    onStatusUpdated={handleStatusUpdated}
                  />
                </div>
              )}

              {/* Customer & Delivery Info */}
              <div className={showAdmin ? "lg:col-span-2" : ""}>
                <div className="bg-dark border border-gold/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gold" />
                    Customer & Delivery Information
                  </h3>
                  
                  {(() => {
                    const customer = getCustomerInfo();
                    return (
                      <>
                        <div className="mb-4">
                          <h4 className="font-medium text-gold mb-2">Contact Details</h4>
                          <p className="text-muted-foreground mb-1 flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {customer.name}
                          </p>
                          <p className="text-muted-foreground mb-1 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {customer.email}
                          </p>
                          <p className="text-muted-foreground mb-1 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {customer.phone}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gold mb-2">Delivery Address</h4>
                          <p className="text-muted-foreground flex items-start">
                            <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink-0" />
                            <span className="text-sm">{getDeliveryAddress()}</span>
                          </p>
                        </div>
                      </>
                    );
                  })()}
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
