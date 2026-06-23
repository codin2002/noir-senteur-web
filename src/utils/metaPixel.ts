// Meta Pixel event helpers
// The base pixel (init + PageView) is loaded in index.html.
// Product identifier sent as content_ids is the perfume's database UUID (perfumes.id).

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const CURRENCY = 'AED';

const track = (event: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', event, params);
    }
  } catch (e) {
    console.warn('Meta Pixel track failed', e);
  }
};

export const fbqViewContent = (p: {
  id: string;
  name: string;
  price: number;
}) => {
  track('ViewContent', {
    content_ids: [p.id],
    content_name: p.name,
    content_type: 'product',
    value: p.price,
    currency: CURRENCY,
  });
};

export const fbqAddToCart = (p: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}) => {
  track('AddToCart', {
    content_ids: [p.id],
    content_name: p.name,
    content_type: 'product',
    value: p.price * (p.quantity ?? 1),
    currency: CURRENCY,
    contents: [{ id: p.id, quantity: p.quantity ?? 1, item_price: p.price }],
  });
};

export const fbqInitiateCheckout = (items: Array<{ id: string; quantity: number; price: number }>, total: number) => {
  track('InitiateCheckout', {
    content_ids: items.map((i) => i.id),
    content_type: 'product',
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    num_items: items.reduce((s, i) => s + i.quantity, 0),
    value: total,
    currency: CURRENCY,
  });
};

export const fbqPurchase = (p: {
  orderId: string;
  items: Array<{ id: string; quantity: number; price: number }>;
  value: number;
}) => {
  track('Purchase', {
    content_ids: p.items.map((i) => i.id),
    content_type: 'product',
    contents: p.items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    num_items: p.items.reduce((s, i) => s + i.quantity, 0),
    value: p.value,
    currency: CURRENCY,
    order_id: p.orderId,
  });
};

// Advanced Matching — call once on login or when user info known.
// Meta hashes these client-side automatically when passed via fbq('init', id, {...}).
export const fbqAdvancedMatch = (info: { email?: string; phone?: string; firstName?: string; lastName?: string }) => {
  try {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    const payload: Record<string, string> = {};
    if (info.email) payload.em = info.email.trim().toLowerCase();
    if (info.phone) payload.ph = info.phone.replace(/[^0-9]/g, '');
    if (info.firstName) payload.fn = info.firstName.trim().toLowerCase();
    if (info.lastName) payload.ln = info.lastName.trim().toLowerCase();
    if (Object.keys(payload).length === 0) return;
    window.fbq('init', '1523641402566185', payload);
  } catch (e) {
    console.warn('Meta Pixel advanced match failed', e);
  }
};
