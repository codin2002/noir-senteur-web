
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Package, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { verifyPayment } = useCheckout();
  const { user } = useAuth();
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyAndProcessPayment = async () => {
      // Prevent multiple calls
      if (hasVerified.current) return;
      hasVerified.current = true;

      // Get all URL parameters for debugging
      const allParams = Object.fromEntries(searchParams.entries());
      console.log('=== PAYMENT SUCCESS PAGE ===');
      console.log('All URL parameters:', allParams);
      console.log('Current full URL:', window.location.href);
      
      // FIXED: Look for the correct parameter name as per Ziina docs
      const paymentIntentId = searchParams.get('payment_intent_id');
      
      console.log('Payment Intent ID found:', paymentIntentId);

      if (!paymentIntentId) {
        console.error('No payment_intent_id found in URL parameters');
        console.error('Available parameters:', Object.keys(allParams));
        setError('Payment verification failed: Missing payment ID. Please contact support if you were charged.');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Starting payment verification with ID:', paymentIntentId);
        const result = await verifyPayment(paymentIntentId);
        
        console.log('Verification result received:', result);
        
        if (result && result.success) {
          setOrderDetails(result);
          console.log('Payment verification successful:', result);
        } else {
          console.error('Payment verification failed:', result);
          setError(result?.message || 'Payment verification failed. Please contact support if you were charged.');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setError(error.message || 'Failed to verify payment. Please contact support if you were charged.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndProcessPayment();
  }, [searchParams, verifyPayment]);

  // Auto-redirect to cart after 10 seconds if there's an error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        navigate('/cart');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

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
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-serif mb-4">Payment Verification Issue</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            
            <div className="bg-darker/50 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-lg font-semibold mb-2 text-red-400">What to do:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check your email for a payment confirmation</li>
                <li>• Contact our support team if you were charged</li>
                <li>• Try placing your order again if needed</li>
                <li>• Screenshot this page for reference</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/cart" className="flex-1">
                <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-darker">
                  Return to Cart
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button className="w-full bg-gold text-darker hover:bg-gold/90">
                  Go to Home
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              You'll be automatically redirected to your cart in a few seconds.
            </p>
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
              <li>• Delivery typically takes 2-4 business days</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
