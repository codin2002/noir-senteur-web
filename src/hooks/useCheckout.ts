
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
    setIsLoading(true);

    try {
      console.log('Processing payment with delivery address:', deliveryAddress);
      
      // For guest checkout, we need to get cart items from localStorage if no user
      let itemsToProcess = cartItems;
      
      if (!user && (!cartItems || cartItems.length === 0)) {
        // Get cart items from localStorage for guest checkout
        const localCart = localStorage.getItem('cartItems');
        if (localCart) {
          itemsToProcess = JSON.parse(localCart);
        } else {
          toast.error('No items found in cart');
          return;
        }
      }

      // Call the create-payment edge function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          cartItems: itemsToProcess,
          deliveryAddress: deliveryAddress.trim(),
          isGuest: !user,
          userId: user?.id || null
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
      
      // Store guest flag for verification
      localStorage.setItem('checkout_is_guest', !user ? 'true' : 'false');
      
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
    // For payment verification, we check if it was a guest checkout
    const isGuest = localStorage.getItem('checkout_is_guest') === 'true';
    
    try {
      // Get stored delivery address
      const deliveryAddress = localStorage.getItem('checkout_delivery_address') || '';
      
      console.log('Verifying payment with delivery address:', deliveryAddress);
      console.log('Is guest checkout:', isGuest);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          paymentIntentId,
          deliveryAddress,
          isGuest,
          userId: user?.id || null
        }
      });

      if (error) {
        console.error('Payment verification error:', error);
        throw new Error(error.message);
      }

      // Clear stored data after successful verification
      localStorage.removeItem('checkout_delivery_address');
      localStorage.removeItem('checkout_is_guest');
      
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
