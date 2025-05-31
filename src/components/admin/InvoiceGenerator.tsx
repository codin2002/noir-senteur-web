
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Share } from 'lucide-react';
import { useOrderDetails } from '@/hooks/useOrderDetails';
import { formatDistanceToNow } from 'date-fns';

interface InvoiceGeneratorProps {
  orderId: string;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ orderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { orderDetails, isLoading, fetchOrderDetails } = useOrderDetails();

  React.useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails(orderId);
    }
  }, [isOpen, orderId]);

  const getCustomerInfo = () => {
    if (!orderDetails) return { name: 'Unknown', email: 'Unknown', phone: 'Unknown' };

    // First check for parsed delivery info (new format)
    if (orderDetails.parsed_delivery_info?.contactName) {
      return {
        name: orderDetails.parsed_delivery_info.contactName,
        email: orderDetails.parsed_delivery_info.email || 'No email provided',
        phone: orderDetails.parsed_delivery_info.phone || 'No phone provided'
      };
    }

    // Then check for guest info (legacy format)
    if (orderDetails.guest_name) {
      return {
        name: orderDetails.guest_name,
        email: orderDetails.guest_email || 'No email provided',
        phone: orderDetails.guest_phone || 'No phone provided'
      };
    }

    // Finally check for user profile (registered user)
    if (orderDetails.user_profile?.full_name) {
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

  const generateInvoiceText = () => {
    if (!orderDetails) return '';

    const customer = getCustomerInfo();
    const deliveryAddress = getDeliveryAddress();

    const items = orderDetails.items.map(item => 
      `• ${item.perfume.name} x${item.quantity} - AED ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const subtotal = orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = orderDetails.total - subtotal;

    return `🧾 *SENTEUR INVOICE*

📋 *Order Details:*
Order ID: #${orderDetails.id.substring(0, 8)}
Date: ${new Date(orderDetails.created_at).toLocaleDateString()}
Status: ${orderDetails.status.toUpperCase()}

👤 *Customer Information:*
Name: ${customer.name}
${customer.email !== 'Via user account' ? `Email: ${customer.email}` : ''}
${customer.phone !== 'Via user account' ? `Phone: ${customer.phone}` : ''}

📍 *Delivery Address:*
${deliveryAddress}

🛍️ *Items Ordered:*
${items}

💰 *Payment Summary:*
Subtotal: AED ${subtotal.toFixed(2)}
Shipping: AED ${shipping.toFixed(2)}
*Total: AED ${orderDetails.total.toFixed(2)}*

Thank you for choosing Senteur! 🌹

---
*Senteur - Premium Fragrances*`;
  };

  const shareViaWhatsApp = () => {
    const invoiceText = generateInvoiceText();
    const encodedText = encodeURIComponent(invoiceText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyInvoice = () => {
    const invoiceText = generateInvoiceText();
    navigator.clipboard.writeText(invoiceText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
        >
          <FileText className="w-4 h-4 mr-1" />
          Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-darker border-gold/20 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gold">Generate Invoice</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            {/* Invoice Preview */}
            <div className="bg-dark border border-gold/10 rounded-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-gold mb-2">SENTEUR</h2>
                <p className="text-sm text-muted-foreground">Premium Fragrances</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gold mb-2">Order Details</h3>
                  <p className="text-sm">Order ID: #{orderDetails.id.substring(0, 8)}</p>
                  <p className="text-sm">Date: {new Date(orderDetails.created_at).toLocaleDateString()}</p>
                  <p className="text-sm">Status: <span className="capitalize">{orderDetails.status}</span></p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gold mb-2">Customer Information</h3>
                  {(() => {
                    const customer = getCustomerInfo();
                    return (
                      <>
                        <p className="text-sm">{customer.name}</p>
                        {customer.email !== 'Via user account' && <p className="text-sm">{customer.email}</p>}
                        {customer.phone !== 'Via user account' && <p className="text-sm">{customer.phone}</p>}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gold mb-2">Delivery Address</h3>
                <p className="text-sm">{getDeliveryAddress()}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gold mb-2">Items Ordered</h3>
                <div className="space-y-2">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.perfume.name} x{item.quantity}</span>
                      <span>AED {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gold/20 pt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal:</span>
                  <span>AED {(orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Shipping:</span>
                  <span>AED {(orderDetails.total - orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gold">
                  <span>Total:</span>
                  <span>AED {orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={shareViaWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Share className="w-4 h-4 mr-2" />
                Share via WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={copyInvoice}
                className="border-gold/30"
              >
                Copy Invoice Text
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load order details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceGenerator;
