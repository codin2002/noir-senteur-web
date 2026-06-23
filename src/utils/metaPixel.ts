// Meta Pixel event helpers
// Base pixel (init + PageView) loads in index.html.
// content_ids = perfumes.id (UUID). Use the same value as the Meta Catalog product ID.
// All monetary values are in AED.
//
// Every event passes an `eventID` (3rd arg to fbq('track', ...)) so the same
// event sent later via the Conversions API can be deduplicated by Meta.
// See: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const PIXEL_ID = '1523641402566185';
const CURRENCY = 'AED';
const PURCHASED_ORDERS_KEY = 'pixel_purchased_orders_v1';

type PixelItem = { id: string; quantity: number; price: number };

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

const newEventId = (prefix: string, key?: string) => {
  if (key) return `${prefix}.${key}`;
  // RFC4122-ish unique id, good enough for pixel/CAPI dedup
  const rand = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}.${rand}`;
};

const track = (event: string, params: Record<string, any>, eventID: string) => {
  try {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    window.fbq('track', event, params, { eventID });
  } catch (e) {
    console.warn(`Meta Pixel ${event} failed`, e);
  }
};

export const fbqViewContent = (p: { id: string; name: string; price: number }) => {
  track(
    'ViewContent',
    {
      content_ids: [p.id],
      content_name: p.name,
      content_type: 'product',
      contents: [{ id: p.id, quantity: 1, item_price: round2(p.price) }],
      value: round2(p.price),
      currency: CURRENCY,
    },
    newEventId('vc', p.id),
  );
};

export const fbqAddToCart = (p: { id: string; name: string; price: number; quantity?: number }) => {
  const qty = p.quantity ?? 1;
  track(
    'AddToCart',
    {
      content_ids: [p.id],
      content_name: p.name,
      content_type: 'product',
      contents: [{ id: p.id, quantity: qty, item_price: round2(p.price) }],
      value: round2(p.price * qty),
      currency: CURRENCY,
    },
    newEventId('atc'),
  );
};

export const fbqInitiateCheckout = (items: PixelItem[], total: number) => {
  track(
    'InitiateCheckout',
    {
      content_ids: items.map((i) => i.id),
      content_type: 'product',
      contents: items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: round2(i.price) })),
      num_items: items.reduce((s, i) => s + i.quantity, 0),
      value: round2(total),
      currency: CURRENCY,
    },
    newEventId('ic'),
  );
};

/**
 * Purchase — fires at most once per orderId across page refreshes/retries.
 * Returns true if the event was sent, false if it was deduplicated locally.
 */
export const fbqPurchase = (p: { orderId: string; items: PixelItem[]; value: number }): boolean => {
  try {
    const sent = JSON.parse(localStorage.getItem(PURCHASED_ORDERS_KEY) || '[]') as string[];
    if (sent.includes(p.orderId)) return false;
    track(
      'Purchase',
      {
        content_ids: p.items.map((i) => i.id),
        content_type: 'product',
        contents: p.items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: round2(i.price) })),
        num_items: p.items.reduce((s, i) => s + i.quantity, 0),
        value: round2(p.value),
        currency: CURRENCY,
        order_id: p.orderId,
      },
      // Stable per-order event_id — Meta CAPI can dedup against the pixel using this.
      newEventId('purchase', p.orderId),
    );
    sent.push(p.orderId);
    // Cap the stored list so it doesn't grow unbounded
    const trimmed = sent.slice(-200);
    localStorage.setItem(PURCHASED_ORDERS_KEY, JSON.stringify(trimmed));
    return true;
  } catch (e) {
    console.warn('Meta Pixel Purchase failed', e);
    return false;
  }
};

/**
 * Advanced Matching — Meta hashes (SHA-256) these client-side automatically
 * when passed via fbq('init', pixelId, userData). Safe to call multiple times;
 * a no-op when no fields are present, and skipped if values are unchanged.
 *
 * Field reference: em, ph, fn, ln, ct, st, zp, country, external_id
 * https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching
 */
const AM_KEY = 'pixel_am_last_v1';

export const fbqAdvancedMatch = (info: {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null;
  externalId?: string | null;
}) => {
  try {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    const payload: Record<string, string> = {};
    if (info.email) payload.em = info.email.trim().toLowerCase();
    if (info.phone) {
      // Meta expects digits only, including country code. Drop spaces, dashes, parens, leading '+'.
      const digits = info.phone.replace(/[^0-9]/g, '');
      if (digits) payload.ph = digits;
    }
    if (info.firstName) payload.fn = info.firstName.trim().toLowerCase();
    if (info.lastName) payload.ln = info.lastName.trim().toLowerCase();
    if (info.city) payload.ct = info.city.trim().toLowerCase().replace(/\s+/g, '');
    if (info.country) payload.country = info.country.trim().toLowerCase().slice(0, 2);
    if (info.externalId) payload.external_id = info.externalId;
    if (Object.keys(payload).length === 0) return;

    // Skip if identical to last init payload — avoids redundant init calls.
    const serialized = JSON.stringify(payload);
    if (localStorage.getItem(AM_KEY) === serialized) return;
    window.fbq('init', PIXEL_ID, payload);
    localStorage.setItem(AM_KEY, serialized);
  } catch (e) {
    console.warn('Meta Pixel advanced match failed', e);
  }
};
