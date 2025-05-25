
import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    deliveryMethod: string;
    deliveryAddress: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setIsVerifying(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data?.success) {
        setOrderDetails({
          orderId: data.orderId,
          deliveryMethod: data.deliveryMethod,
          deliveryAddress: data.deliveryAddress
        });
        toast.success('Payment successful!', {
          description: 'Your order has been confirmed and is being processed.'
        });
      } else {
        toast.error('Payment verification failed', {
          description: 'Please contact support if you believe this is an error.'
        });
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error('Unable to verify payment', {
        description: 'Please contact support for assistance.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. Your payment has been processed successfully.
          </p>
        </div>

        {orderDetails && (
          <div className="bg-darker border border-gold/20 rounded-lg p-4 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gold" />
              <div>
                <p className="font-medium">Order ID</p>
                <p className="text-sm text-muted-foreground">{orderDetails.orderId}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold mt-1" />
              <div>
                <p className="font-medium">
                  {orderDetails.deliveryMethod === 'home' ? 'Delivery Address' : 'Pickup Point'}
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {orderDetails.deliveryAddress}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {orderDetails?.deliveryMethod === 'home' 
              ? 'Your perfumes will be delivered to your address within 2-3 business days.'
              : 'Your perfumes are ready for pickup. You will receive a notification when ready.'
            }
          </p>
          
          <div className="flex gap-3">
            <Button asChild className="flex-1 bg-gold text-darker hover:bg-gold/80">
              <Link to="/">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-gold/30 hover:bg-gold/10">
              <Link to="/profile">View Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
