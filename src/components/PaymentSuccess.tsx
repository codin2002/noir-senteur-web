
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCheckout } from '@/hooks/useCheckout';
import PaymentVerificationLoader from './payment/PaymentVerificationLoader';
import PaymentVerificationError from './payment/PaymentVerificationError';
import PaymentSuccessContent from './payment/PaymentSuccessContent';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { verifyPayment } = useCheckout();
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
    return <PaymentVerificationLoader />;
  }

  if (error) {
    return <PaymentVerificationError error={error} />;
  }

  return <PaymentSuccessContent orderDetails={orderDetails} />;
};

export default PaymentSuccess;
