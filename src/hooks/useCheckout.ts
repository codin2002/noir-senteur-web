
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { CartItemType } from '@/components/cart/CartItem';

export const useCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, session } = useAuth();

  const processCheckout = async (
    cartItems: CartItemType[],
    deliveryAddress: string
  ) => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    if (!user || !session) {
      toast.error('Please sign in to continue');
      return;
    }

    console.log('Starting checkout process...');
    console.log('User:', user.id, user.email);
    console.log('Session exists:', !!session);
    console.log('Cart items:', cartItems);
    console.log('Delivery address:', deliveryAddress);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.perfume.price_value * item.quantity), 0);
    const shipping = 1;
    const total = subtotal + shipping;
    
    console.log('Total amount:', total);

    setIsProcessing(true);
    
    try {
      // Store payment info in localStorage for later verification
      const paymentInfo = {
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.full_name || user.email,
        cartItems: cartItems.map(item => ({
          perfume_id: item.perfume.id,
          quantity: item.quantity,
          price: item.perfume.price_value
        })),
        deliveryAddress,
        totalAmount: total,
        timestamp: Date.now()
      };
      
      console.log('Storing payment info in localStorage:', paymentInfo);
      localStorage.setItem('ziina_payment_info', JSON.stringify(paymentInfo));

      console.log('Calling create-payment function...');
      
      // Use the current session's access token directly
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          cartItems,
          deliveryAddress
        }
      });

      console.log('Create-payment response:', { data, error });

      if (error) {
        console.error('Payment creation error:', error);
        throw error;
      }

      if (data?.success && data?.payment_url) {
        console.log('Payment URL received:', data.payment_url);
        console.log('Payment ID:', data.payment_id);
        
        // Update stored payment info with payment ID
        const updatedPaymentInfo = {
          ...paymentInfo,
          paymentId: data.payment_id
        };
        localStorage.setItem('ziina_payment_info', JSON.stringify(updatedPaymentInfo));
        
        toast.success('Redirecting to payment...', {
          description: 'You will be redirected to complete your payment.'
        });
        
        console.log('Opening payment URL in current window...');
        // Open payment URL in current window instead of new tab
        window.location.href = data.payment_url;
      } else {
        console.error('Invalid payment response:', data);
        throw new Error('Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Payment failed', {
        description: error.message || 'Unable to process payment. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processCheckout
  };
};
