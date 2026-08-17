export type CheckoutAttribution = {
  trafficSource: 'meta_ads' | 'direct' | 'unknown';
  metaClickId?: string;
  fbp?: string;
  fbc?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmContent?: string;
  landingUrl?: string;
  capturedAt: number;
};

const STORAGE_KEY = 'senteur_order_attribution_v1';
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

const cookieValue = (name: string) =>
  document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`))?.split('=').slice(1).join('=');

const readStored = (): CheckoutAttribution | null => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as CheckoutAttribution | null;
    return stored && Date.now() - stored.capturedAt <= MAX_AGE_MS ? stored : null;
  } catch {
    return null;
  }
};

export const captureAttribution = () => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const existing = readStored();
  const metaClickId = params.get('fbclid') || undefined;
  const fbc = cookieValue('_fbc');
  const fbp = cookieValue('_fbp');
  const utmSource = params.get('utm_source') || undefined;
  const normalizedSource = utmSource?.toLowerCase();
  const hasMetaSignal = Boolean(metaClickId || fbc || ['facebook', 'instagram', 'meta', 'fb', 'ig'].includes(normalizedSource || ''));
  const hasCampaignSignal = Boolean(utmSource || params.get('utm_campaign') || params.get('utm_content'));
  const isDirect = !document.referrer && !hasCampaignSignal;

  // Preserve the first useful touch, but a later explicit Meta click should
  // replace a direct/unknown touch so the order carries the strongest signal.
  if (existing && !(hasMetaSignal && existing.trafficSource !== 'meta_ads')) return;

  const attribution: CheckoutAttribution = {
    trafficSource: hasMetaSignal ? 'meta_ads' : isDirect ? 'direct' : 'unknown',
    metaClickId,
    fbc,
    fbp,
    utmSource,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmContent: params.get('utm_content') || undefined,
    landingUrl: window.location.href.slice(0, 1000),
    capturedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
};

export const getCheckoutAttribution = (): CheckoutAttribution => {
  captureAttribution();
  const stored = readStored();
  const fbc = cookieValue('_fbc') || stored?.fbc;
  const fbp = cookieValue('_fbp') || stored?.fbp;
  return {
    ...(stored || { trafficSource: fbc ? 'meta_ads' : 'unknown', capturedAt: Date.now() }),
    trafficSource: fbc ? 'meta_ads' : stored?.trafficSource || 'unknown',
    fbc,
    fbp,
  };
};
