
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

  const getCustomerName = () => {
    if (orderDetails?.guest_name) {
      return orderDetails.guest_name;
    }
    if (orderDetails?.user_profile?.full_name) {
      return orderDetails.user_profile.full_name;
    }
    return 'Registered User';
  };

  const getCustomerEmail = () => {
    if (orderDetails?.guest_email) {
      return orderDetails.guest_email;
    }
    return 'Via user account';
  };

  const getCustomerPhone = () => {
    if (orderDetails?.guest_phone) {
      return orderDetails.guest_phone;
    }
    if (orderDetails?.user_profile?.phone) {
      return orderDetails.user_profile.phone;
    }
    return 'Via user account';
  };

  const generateInvoiceText = () => {
    if (!orderDetails) return '';

    const items = orderDetails.items.map(item => 
      `• ${item.perfume.name} x${item.quantity} - AED ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const subtotal = orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = orderDetails.total - subtotal;

    const customerName = getCustomerName();
    const customerEmail = getCustomerEmail();
    const customerPhone = getCustomerPhone();

    return `🧾 *SENTEUR INVOICE*

📋 *Order Details:*
Order ID: #${orderDetails.id.substring(0, 8)}
Date: ${new Date(orderDetails.created_at).toLocaleDateString()}
Status: ${orderDetails.status.toUpperCase()}

👤 *Customer Information:*
Name: ${customerName}
${customerEmail !== 'Via user account' ? `Email: ${customerEmail}` : ''}
${customerPhone !== 'Via user account' ? `Phone: ${customerPhone}` : ''}

📍 *Delivery Address:*
${orderDetails.delivery_address || 'Address on file'}

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
    // You could add a toast here if you want
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
                  <p className="text-sm">{getCustomerName()}</p>
                  {getCustomerEmail() !== 'Via user account' && <p className="text-sm">{getCustomerEmail()}</p>}
                  {getCustomerPhone() !== 'Via user account' && <p className="text-sm">{getCustomerPhone()}</p>}
                </div>
              </div>

              {orderDetails.delivery_address && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gold mb-2">Delivery Address</h3>
                  <p className="text-sm">{orderDetails.delivery_address}</p>
                </div>
              )}

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
