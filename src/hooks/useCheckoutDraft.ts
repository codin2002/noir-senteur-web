import { useEffect, useRef, useState } from 'react';
import type { CartItemType } from '@/components/cart/CartItem';
import { supabase } from '@/integrations/supabase/client';
import { getCheckoutAttribution } from '@/utils/attribution';
import { CheckoutDetails, formatCheckoutDeliveryAddress, isCheckoutDetailsValid } from '@/utils/checkoutDetails';

const STORAGE_KEY = 'senteur_checkout_draft_token';

export const useCheckoutDraft = (cartItems: CartItemType[], details: CheckoutDetails, offerId?: string, enabled = true) => {
  const [draftToken, setDraftToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const lastPayload = useRef('');

  useEffect(() => {
    if (!enabled || !cartItems.length || !isCheckoutDetailsValid(details)) return;

    const deliveryAddress = formatCheckoutDeliveryAddress(details);
    const payloadKey = JSON.stringify({ cartItems, deliveryAddress, offerId });
    if (payloadKey === lastPayload.current) return;

    const timer = window.setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke('save-checkout-draft', {
        body: {
          cartItems,
          deliveryAddress,
          offerId,
          draftToken: draftToken || undefined,
          meta: getCheckoutAttribution(),
        },
      });
      if (!error && data?.success && typeof data.draftToken === 'string') {
        lastPayload.current = payloadKey;
        setDraftToken(data.draftToken);
        localStorage.setItem(STORAGE_KEY, data.draftToken);
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [cartItems, details, draftToken, enabled, offerId]);

  const clearDraftToken = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDraftToken(null);
    lastPayload.current = '';
  };

  return { draftToken, clearDraftToken };
};
