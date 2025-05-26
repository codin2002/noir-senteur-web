
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const processPayment = async (cartItems: any[], deliveryAddress: string) => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Processing payment with delivery address:', deliveryAddress);
      
      // Call the create-payment edge function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          cartItems,
          deliveryAddress: deliveryAddress.trim()
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        toast.error('Failed to create payment session', {
          description: error.message
        });
        return;
      }

      if (!data.success) {
        console.error('Payment creation failed:', data.error);
        toast.error('Payment creation failed', {
          description: data.error?.message || 'Unknown error occurred'
        });
        return;
      }

      console.log('Payment session created successfully');
      
      // Store delivery address in localStorage for verification
      if (deliveryAddress.trim()) {
        localStorage.setItem('checkout_delivery_address', deliveryAddress.trim());
      }
      
      // Redirect to Ziina payment page
      window.location.href = data.payment_url;
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed', {
        description: error.message || 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (paymentIntentId: string) => {
    if (!user) {
      toast.error('Please sign in to continue');
      return null;
    }

    try {
      // Get stored delivery address
      const deliveryAddress = localStorage.getItem('checkout_delivery_address') || '';
      
      console.log('Verifying payment with delivery address:', deliveryAddress);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          paymentIntentId,
          deliveryAddress
        }
      });

      if (error) {
        console.error('Payment verification error:', error);
        throw new Error(error.message);
      }

      // Clear stored delivery address after successful verification
      localStorage.removeItem('checkout_delivery_address');
      
      return data;
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  };

  return {
    processPayment,
    verifyPayment,
    isLoading
  };
};
