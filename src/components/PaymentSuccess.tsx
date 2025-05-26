
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { verifyPayment } = useCheckout();
  const { user } = useAuth();

  useEffect(() => {
    const verifyAndProcessPayment = async () => {
      const paymentIntentId = searchParams.get('payment_intent');
      
      if (!paymentIntentId) {
        setError('No payment information found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Verifying payment with ID:', paymentIntentId);
        const result = await verifyPayment(paymentIntentId);
        
        if (result.success) {
          setOrderDetails(result);
          console.log('Payment verification successful:', result);
        } else {
          setError('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setError('Failed to verify payment');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndProcessPayment();
  }, [searchParams, verifyPayment]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-serif mb-2">Verifying your payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your order.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-serif mb-4">Payment Verification Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-darker">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-4xl font-serif mb-4">Payment Successful!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {orderDetails && (
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
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-darker">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            
            {/* Only show "View Orders" button for authenticated users */}
            {user && (
              <Link to="/profile?tab=history">
                <Button className="bg-gold text-darker hover:bg-gold/90">
                  <Package className="w-4 h-4 mr-2" />
                  View Purchase History
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-12 p-6 bg-darker/50 border border-gold/10 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
            <ul className="text-muted-foreground text-left space-y-2">
              <li>• You will receive an order confirmation email shortly</li>
              <li>• Your order will be processed within 1-2 business days</li>
              <li>• Delivery typically takes 2-5 business days</li>
              <li>• You'll receive tracking information once shipped</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
