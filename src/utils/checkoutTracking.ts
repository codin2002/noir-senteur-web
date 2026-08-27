import { OFFERS, getCartSubtotal, getSignatureDuoQuantity } from '@/utils/constants';
import { PixelItem, fbqCheckoutStage, fbqInitiateCheckout } from '@/utils/metaPixel';

export interface CheckoutPixelSnapshot {
  items: PixelItem[];
  value: number;
}

interface TrackableCartItem {
  perfume?: { id?: string; price_value?: number };
  perfume_id?: string;
  price?: number;
  quantity?: number;
}

export const buildCheckoutPixelSnapshot = (cartItems: TrackableCartItem[], offerId?: string): CheckoutPixelSnapshot => {
  let items = cartItems.map((item) => ({
    id: item.perfume?.id ?? item.perfume_id,
    quantity: Number(item.quantity || 1),
    price: Number(item.perfume?.price_value ?? item.price ?? 0),
  })).filter((item: PixelItem) => Boolean(item.id) && item.quantity > 0);

  let value = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (offerId === OFFERS.SIGNATURE_DUO.ID && items.length > 0) {
    const duoQuantity = getSignatureDuoQuantity(cartItems);
    const discountPerBottle = duoQuantity > 0 ? OFFERS.SIGNATURE_DUO.SAVINGS / 2 : 0;
    let discountedLinesRemaining = duoQuantity;
    items = items.map((item) => {
      if (OFFERS.SIGNATURE_DUO.PRODUCT_IDS.includes(item.id) && discountedLinesRemaining > 0) {
        discountedLinesRemaining -= 1;
        return { ...item, price: item.price - discountPerBottle };
      }
      return item;
    });
    value = getCartSubtotal(cartItems);
  }

  return { items, value };
};

export const trackCheckoutFormOpened = (cartItems: TrackableCartItem[], offerId?: string) => {
  const snapshot = buildCheckoutPixelSnapshot(cartItems, offerId);
  const signature = JSON.stringify({ ids: snapshot.items.map((item) => [item.id, item.quantity]), value: snapshot.value, offerId: offerId || null });
  try {
    const previous = JSON.parse(sessionStorage.getItem('checkout_form_opened_v1') || 'null') as { signature?: string; at?: number } | null;
    if (previous?.signature === signature && Date.now() - Number(previous.at || 0) < 3_000) return;
    sessionStorage.setItem('checkout_form_opened_v1', JSON.stringify({ signature, at: Date.now() }));
  } catch {
    // Tracking must never block checkout if browser storage is unavailable.
  }
  fbqInitiateCheckout(snapshot.items, snapshot.value);
  fbqCheckoutStage('CheckoutFormOpened', snapshot.items, snapshot.value);
  localStorage.setItem('pixel_pending_purchase', JSON.stringify(snapshot));
};
