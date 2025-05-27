
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
      console.log('User authenticated:', !!user);
      
      // For guest checkout, we need to get cart items from localStorage if no user
      let itemsToProcess = cartItems;
      const isGuest = !user;
      
      if (isGuest && (!cartItems || cartItems.length === 0)) {
        // Get cart items from localStorage for guest checkout
        const localCart = localStorage.getItem('cartItems');
        if (localCart) {
          itemsToProcess = JSON.parse(localCart);
        } else {
          toast.error('No items found in cart');
          return;
        }
      }

      // Prepare the request body
      const requestBody = {
        cartItems: itemsToProcess,
        deliveryAddress: deliveryAddress.trim(),
        isGuest: isGuest,
        userId: user?.id || null
      };

      console.log('Sending payment request:', { 
        itemCount: itemsToProcess.length, 
        isGuest, 
        hasDeliveryAddress: !!deliveryAddress.trim() 
      });

      // Call the create-payment edge function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: requestBody,
        headers: isGuest ? {} : undefined // Don't send auth headers for guest checkout
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
      
      // Store guest flag and cart items for verification
      localStorage.setItem('checkout_is_guest', isGuest ? 'true' : 'false');
      if (isGuest) {
        localStorage.setItem('checkout_cart_items', JSON.stringify(itemsToProcess));
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
    console.log('=== PAYMENT VERIFICATION STARTED ===');
    console.log('Payment Intent ID:', paymentIntentId);
    console.log('Current user:', user?.id || 'No user');
    
    // For payment verification, we check if it was a guest checkout
    const isGuest = localStorage.getItem('checkout_is_guest') === 'true';
    let cartItems = [];
    
    if (isGuest) {
      // Get cart items from localStorage for guest verification
      const storedCartItems = localStorage.getItem('checkout_cart_items');
      if (storedCartItems) {
        cartItems = JSON.parse(storedCartItems);
      }
    }
    
    try {
      // Get stored delivery address
      const deliveryAddress = localStorage.getItem('checkout_delivery_address') || '';
      
      console.log('Verifying payment with delivery address:', deliveryAddress);
      console.log('Is guest checkout:', isGuest);
      console.log('Cart items for verification:', cartItems.length);
      console.log('User ID being sent:', isGuest ? null : user?.id);
      
      const requestBody = {
        paymentIntentId,
        deliveryAddress,
        isGuest,
        userId: isGuest ? null : user?.id,
        cartItems: isGuest ? cartItems : undefined
      };

      console.log('Request body:', requestBody);

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: requestBody
      });

      console.log('Verification response received:', { success: data?.success, error });

      if (error) {
        console.error('Payment verification error:', error);
        return {
          success: false,
          message: error.message || 'Failed to verify payment'
        };
      }

      if (!data) {
        console.error('No data received from verification');
        return {
          success: false,
          message: 'No response received from payment verification'
        };
      }

      if (!data.success) {
        console.error('Payment verification failed:', data);
        return {
          success: false,
          message: data.message || 'Payment verification failed'
        };
      }

      // Clear stored data after successful verification
      localStorage.removeItem('checkout_delivery_address');
      localStorage.removeItem('checkout_is_guest');
      if (isGuest) {
        localStorage.removeItem('checkout_cart_items');
        localStorage.removeItem('cartItems'); // Clear guest cart
      }
      
      // Trigger cart update event to refresh cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      console.log('Payment verification successful:', data);
      return data;
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        message: error.message || 'Payment verification failed'
      };
    }
  };

  return {
    processPayment,
    verifyPayment,
    isLoading
  };
};
