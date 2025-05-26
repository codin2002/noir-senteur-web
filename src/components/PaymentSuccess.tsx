import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    deliveryMethod: string;
    deliveryAddress: string;
    paymentMethod: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('=== PaymentSuccess Component Mounted ===');
    console.log('Full URL:', window.location.href);
    console.log('Location pathname:', location.pathname);
    console.log('Location search:', location.search);
    console.log('Location hash:', location.hash);
    console.log('Current user:', user?.id);
    
    // Parse ALL possible URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const allParams: Record<string, string> = {};
    
    console.log('=== ALL URL PARAMETERS ===');
    for (const [key, value] of urlParams.entries()) {
      allParams[key] = value;
      console.log(`${key}: ${value}`);
    }
    
    // Check for common Ziina parameters
    const ziinaParams = {
      status: urlParams.get('status'),
      payment_id: urlParams.get('payment_id'),
      transaction_id: urlParams.get('transaction_id'),
      result: urlParams.get('result'),
      success: urlParams.get('success'),
      payment_intent_id: urlParams.get('payment_intent_id'),
      ziina_payment_id: urlParams.get('ziina_payment_id')
    };
    
    console.log('=== ZIINA PARAMETERS CHECK ===');
    console.log('Ziina params found:', ziinaParams);
    
    // Check for Stripe parameters
    const stripeParams = {
      session_id: urlParams.get('session_id'),
      payment_intent: urlParams.get('payment_intent'),
      payment_intent_client_secret: urlParams.get('payment_intent_client_secret')
    };
    
    console.log('=== STRIPE PARAMETERS CHECK ===');
    console.log('Stripe params found:', stripeParams);
    
    // Check localStorage for payment info
    const storedInfo = localStorage.getItem('ziina_payment_info');
    console.log('=== STORED PAYMENT INFO ===');
    console.log('Stored payment info exists:', !!storedInfo);
    if (storedInfo) {
      try {
        const parsedInfo = JSON.parse(storedInfo);
        console.log('Parsed stored info:', parsedInfo);
      } catch (e) {
        console.error('Error parsing stored info:', e);
      }
    }
    
    // Determine payment type and proceed
    if (stripeParams.session_id) {
      console.log('=== PROCESSING STRIPE PAYMENT ===');
      verifyPayment(stripeParams.session_id);
    } else if (ziinaParams.status || ziinaParams.payment_id || ziinaParams.transaction_id) {
      console.log('=== PROCESSING ZIINA PAYMENT ===');
      const paymentId = ziinaParams.payment_id || ziinaParams.transaction_id || ziinaParams.payment_intent_id || ziinaParams.ziina_payment_id;
      const status = ziinaParams.status || ziinaParams.result || (ziinaParams.success === 'true' ? 'success' : 'failed');
      
      console.log('Using payment ID:', paymentId);
      console.log('Using status:', status);
      
      if (paymentId) {
        verifyZiinaPayment(paymentId, status);
      } else {
        console.error('=== NO VALID PAYMENT ID FOUND ===');
        console.log('All available params:', allParams);
        setIsVerifying(false);
        toast.error('Payment ID not found', {
          description: 'Unable to find payment ID in URL parameters'
        });
      }
    } else {
      console.error('=== NO PAYMENT PARAMETERS FOUND ===');
      console.log('Available URL params:', allParams);
      console.log('Current URL:', window.location.href);
      
      // Try to handle case where user navigated directly to payment-success
      if (storedInfo) {
        console.log('=== ATTEMPTING TO USE STORED INFO ===');
        try {
          const parsedInfo = JSON.parse(storedInfo);
          if (parsedInfo.paymentId) {
            console.log('Using stored payment ID:', parsedInfo.paymentId);
            verifyZiinaPayment(parsedInfo.paymentId, 'success');
            return;
          }
        } catch (e) {
          console.error('Error using stored info:', e);
        }
      }
      
      setIsVerifying(false);
      toast.error('No payment information found', {
        description: 'Unable to verify payment status from URL parameters'
      });
    }
  }, [searchParams, user, location]);

  const clearCartEverywhere = async () => {
    try {
      console.log('=== Clearing cart everywhere ===');
      console.log('User ID:', user?.id);
      
      // Clear localStorage cart
      const cartItemsBefore = localStorage.getItem('cartItems');
      console.log('Cart items before clearing:', cartItemsBefore);
      
      localStorage.removeItem('cartItems');
      localStorage.removeItem('ziina_payment_info');
      console.log('Cleared localStorage cart items and payment info');
      
      // Clear database cart if user is authenticated
      if (user) {
        console.log('Clearing database cart for user:', user.id);
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error clearing database cart:', error);
        } else {
          console.log('Cart cleared from database successfully');
        }
      }
      
      // Trigger cart count refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      console.log('Cart update event dispatched');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const verifyZiinaPayment = async (paymentId: string, status: string) => {
    try {
      console.log('=== Starting Ziina payment verification ===');
      console.log('Payment ID:', paymentId);
      console.log('Status:', status);
      
      // Get stored payment info from localStorage
      const storedInfo = localStorage.getItem('ziina_payment_info');
      console.log('Retrieved stored payment info:', storedInfo);
      
      if (!storedInfo) {
        throw new Error('Payment information not found in storage. Please contact support.');
      }

      const paymentInfo = JSON.parse(storedInfo);
      console.log('Parsed payment info:', paymentInfo);
      
      // Verify with our backend
      console.log('=== Calling verify-payment function ===');
      const verifyPayload = { 
        paymentId,
        ziinaResponse: {
          status: status === 'success' ? 'success' : 'failed',
          payment_id: paymentId,
          metadata: {
            user_id: paymentInfo.userId || user?.id,
            user_email: paymentInfo.userEmail || user?.email,
            user_name: paymentInfo.userName || user?.user_metadata?.full_name || '',
            delivery_address: paymentInfo.deliveryAddress,
            delivery_method: 'home',
            total_amount: paymentInfo.totalAmount.toString(),
            cart_items: JSON.stringify(paymentInfo.cartItems)
          }
        }
      };
      
      console.log('Verify payment payload:', verifyPayload);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: verifyPayload
      });

      console.log('=== Verification response ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Verification error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('=== Payment verification successful ===');
        console.log('Order ID:', data.orderId);
        
        setOrderDetails({
          orderId: data.orderId,
          deliveryMethod: data.deliveryMethod || 'home',
          deliveryAddress: data.deliveryAddress || paymentInfo.deliveryAddress,
          paymentMethod: 'ziina'
        });
        
        // Clear cart everywhere
        await clearCartEverywhere();
        
        toast.success('Payment successful!', {
          description: 'Your order has been confirmed and is being processed.'
        });

        // Send order confirmation email
        try {
          console.log('=== Sending order confirmation email ===');
          await supabase.functions.invoke('send-order-confirmation', {
            body: { orderId: data.orderId }
          });
          console.log('Order confirmation email sent successfully');
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't show error to user as the order was successful
        }
      } else {
        console.error('Payment verification failed:', data);
        toast.error('Payment verification failed', {
          description: 'Please contact support if you believe this is an error.'
        });
      }
    } catch (error: any) {
      console.error('=== Ziina payment verification error ===', error);
      toast.error('Unable to verify payment', {
        description: error.message || 'Please contact support for assistance.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log('=== Starting Stripe payment verification ===');
      console.log('Session ID:', sessionId);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      console.log('Stripe verification response:', { data, error });

      if (error) throw error;

      if (data?.success) {
        console.log('Stripe payment verification successful');
        setOrderDetails({
          orderId: data.orderId,
          deliveryMethod: data.deliveryMethod,
          deliveryAddress: data.deliveryAddress,
          paymentMethod: data.paymentMethod || 'stripe'
        });
        
        // Clear cart everywhere
        await clearCartEverywhere();
        
        toast.success('Payment successful!', {
          description: 'Your order has been confirmed and is being processed.'
        });
      } else {
        console.log('Stripe payment verification failed:', data);
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
          <p className="text-sm text-muted-foreground mt-2">Please wait while we process your order</p>
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
            Thank you for your order. Your payment has been processed successfully and your cart has been cleared.
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

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-gold text-sm">💳</span>
              </div>
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground capitalize">{orderDetails.paymentMethod}</p>
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
              <Link to="/profile?tab=history">View Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
