
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { fbqInitiateCheckout, fbqPurchase, fbqAdvancedMatch } from '@/utils/metaPixel';
import { OFFERS, getCartSubtotal, getSignatureDuoQuantity } from '@/utils/constants';
import { getCheckoutAttribution } from '@/utils/attribution';

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const checkoutV2Enabled = import.meta.env.VITE_CHECKOUT_V2 === 'true';

  const processPayment = async (
    cartItems: any[],
    deliveryAddress: string,
    options?: { preserveCart?: boolean; offerId?: string }
  ) => {
    setIsLoading(true);
    // The Signature Duo has a server-priced promotional total, so it must use
    // the newer checkout path even while ordinary single-bottle checkout
    // remains on the legacy flow during rollout.
    const useCheckoutV2 = checkoutV2Enabled || options?.offerId === OFFERS.SIGNATURE_DUO.ID;

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
        userId: user?.id || null,
        offerId: options?.offerId,
        meta: getCheckoutAttribution(),
      };

      console.log('Sending payment request:', { 
        itemCount: itemsToProcess.length, 
        isGuest, 
        hasDeliveryAddress: !!deliveryAddress.trim() 
      });

      // The new webhook-confirmed flow is opt-in during local/staging testing.
      const { data, error } = await supabase.functions.invoke(useCheckoutV2 ? 'create-payment-v2' : 'create-payment', {
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
          description: data.message || data.error?.message || 'Unknown error occurred'
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
      localStorage.setItem('checkout_preserve_cart', options?.preserveCart ? 'true' : 'false');
      if (isGuest) {
        localStorage.setItem('checkout_cart_items', JSON.stringify(itemsToProcess));
      }

      // Meta Pixel: InitiateCheckout
      let pixelItems = itemsToProcess.map((it: any) => ({
        id: it.perfume?.id ?? it.perfume_id,
        quantity: it.quantity,
        price: Number(it.perfume?.price_value ?? 0),
      }));
      let pixelTotal = pixelItems.reduce((s, i) => s + i.price * i.quantity, 0);
      if (options?.offerId === OFFERS.SIGNATURE_DUO.ID && pixelItems.length > 0) {
        const duoQuantity = getSignatureDuoQuantity(itemsToProcess);
        const discountPerBottle = duoQuantity > 0 ? OFFERS.SIGNATURE_DUO.SAVINGS / 2 : 0;
        let duoDiscountsRemaining = duoQuantity;
        pixelItems = pixelItems.map((item) => {
          if (OFFERS.SIGNATURE_DUO.PRODUCT_IDS.includes(item.id) && duoDiscountsRemaining > 0) {
            duoDiscountsRemaining -= 1;
            return { ...item, price: item.price - discountPerBottle };
          }
          return item;
        });
        pixelTotal = getCartSubtotal(itemsToProcess);
      }
      fbqInitiateCheckout(pixelItems, pixelTotal);
      // Save snapshot for Purchase event after redirect
      localStorage.setItem('pixel_pending_purchase', JSON.stringify({ items: pixelItems, value: pixelTotal }));

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

  const verifyPayment = async (paymentIntentId: string, checkoutToken?: string | null) => {
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
      // A returned checkout token is issued only by create-payment-v2. This
      // keeps bundle confirmation on the webhook-safe path after redirect,
      // even if the regular checkout rollout flag is still off.
      if (checkoutV2Enabled || checkoutToken) {
        if (!checkoutToken) return { success: false, message: 'The secure checkout token is missing. Please contact support if you were charged.' };
        // This endpoint only reads the webhook-confirmed order. It never creates
        // an order, records a payment, or changes stock from the browser.
        let result: any = null;
        for (let attempt = 0; attempt < 15; attempt += 1) {
          const { data, error } = await supabase.functions.invoke('get-checkout-status-v2', {
            body: { paymentIntentId, checkoutToken },
          });
          if (!error) {
            result = data;
            if (data?.confirmed || data?.status === 'failed') break;
          } else {
            console.warn('Confirmed order lookup will be retried', error);
          }
          await new Promise((resolve) => window.setTimeout(resolve, 1000));
        }
        if (!result?.confirmed) return { success: false, message: 'Payment confirmation is still processing. Please refresh this page shortly.' };

        localStorage.removeItem('checkout_delivery_address');
        localStorage.removeItem('checkout_is_guest');
        localStorage.removeItem('checkout_cart_items');
        const preserveCart = localStorage.getItem('checkout_preserve_cart') === 'true';
        if (!preserveCart) localStorage.removeItem('cartItems');
        localStorage.removeItem('checkout_preserve_cart');
        window.dispatchEvent(new Event('cartUpdated'));
        try {
          if (user?.email) fbqAdvancedMatch({ email: user.email, externalId: user.id });
          const snapshot = localStorage.getItem('pixel_pending_purchase');
          if (snapshot && result.orderId) {
            const { items, value } = JSON.parse(snapshot);
            if (fbqPurchase({ orderId: result.orderId, items, value })) localStorage.removeItem('pixel_pending_purchase');
          }
        } catch (pixelError) {
          console.warn('Pixel purchase tracking failed', pixelError);
        }
        return result;
      }

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
        cartItems: isGuest ? cartItems : undefined,
        meta: getCheckoutAttribution(),
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

      // Meta Pixel: Advanced Matching first (so Purchase is enriched), then Purchase.
      try {
        if (user?.email) {
          fbqAdvancedMatch({ email: user.email, externalId: user.id });
        }
        const snapshot = localStorage.getItem('pixel_pending_purchase');
        if (snapshot && data?.orderId) {
          const { items, value } = JSON.parse(snapshot);
          const fired = fbqPurchase({ orderId: data.orderId, items, value });
          if (fired) localStorage.removeItem('pixel_pending_purchase');
        }
      } catch (e) {
        console.warn('Pixel purchase tracking failed', e);
      }

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
