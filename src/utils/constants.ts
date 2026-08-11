/** Central storage for application constants. */
export const PRICING = {
  PERFUME_PRICE: 125,
  CURRENCY: 'AED',
  CURRENCY_SYMBOL: 'AED ',
  SHIPPING_COST: 0,
  FREE_SHIPPING_THRESHOLD: 1,
};

export const PERFUMES = {
  THREE_ONE_THREE: {
    ID: '890882bb-0dba-4712-a5a9-380cf9e7ff58',
    NAME: '\u0663\u0661\u0663',
    DISPLAY_NAME: '\u0663\u0661\u0663',
    NOTES: 'Amber, Oud, Vanilla',
    DESCRIPTION: 'Our signature perfume with complex notes of amber and oud, finished with a touch of vanilla for a sophisticated, long-lasting aroma.',
    SHORT_DESCRIPTION: 'A sophisticated blend of amber and oud with vanilla undertones.',
  },
  FOUR_TWO_FOUR: {
    ID: '37b4d1ef-6589-4852-a74d-c4a10bc04302',
    NAME: '\u0664\u0662\u0664',
    DISPLAY_NAME: '\u0664\u0662\u0664',
    NOTES: 'Amber, Oud, Cashmere',
    DESCRIPTION: '424 opens with a sweet blend of cotton candy and raspberry, creating an irresistible first impression. As it settles, a soft floral heart adds elegance, before revealing its signature base of musk, leather, and patchouli, leaving behind a warm & sensual trail.',
    SHORT_DESCRIPTION: 'A warm and spicy blend with amber, oud and cashmere.',
  },
};

export const OFFERS = {
  SIGNATURE_DUO: {
    ID: 'signature-duo-313-424',
    NAME: 'The Senteur Signature Duo',
    PRICE: 220,
    REGULAR_PRICE: 250,
    SAVINGS: 30,
    PRODUCT_IDS: [
      '890882bb-0dba-4712-a5a9-380cf9e7ff58',
      '37b4d1ef-6589-4852-a74d-c4a10bc04302',
    ],
  },
} as const;

export const getSignatureDuoQuantity = (items: Array<{ perfume?: { id?: string }; quantity?: number }>) => {
  const quantities = new Map<string, number>();
  for (const item of items) {
    const productId = item.perfume?.id;
    if (!productId) continue;
    quantities.set(productId, (quantities.get(productId) || 0) + Number(item.quantity || 0));
  }
  return Math.min(...OFFERS.SIGNATURE_DUO.PRODUCT_IDS.map((productId) => quantities.get(productId) || 0));
};

export const isSignatureDuoCart = (items: Array<{ perfume?: { id?: string }; quantity?: number }>) =>
  getSignatureDuoQuantity(items) > 0;

export const getSignatureDuoSavings = (items: Array<{ perfume?: { id?: string }; quantity?: number }>) =>
  getSignatureDuoQuantity(items) * OFFERS.SIGNATURE_DUO.SAVINGS;

export const getCartSubtotal = (items: Array<{ perfume?: { price_value?: number }; quantity?: number }>) => {
  const regularSubtotal = items.reduce(
    (sum, item) => sum + Number(item.perfume?.price_value || 0) * Number(item.quantity || 0),
    0,
  );
  return regularSubtotal - getSignatureDuoSavings(items);
};

export const getPerfumeDisplayName = (perfume: { id?: string; name: string }) => {
  if (perfume.id === PERFUMES.THREE_ONE_THREE.ID || perfume.name === PERFUMES.THREE_ONE_THREE.NAME) {
    return PERFUMES.THREE_ONE_THREE.DISPLAY_NAME;
  }
  if (perfume.id === PERFUMES.FOUR_TWO_FOUR.ID || perfume.name === PERFUMES.FOUR_TWO_FOUR.NAME) {
    return PERFUMES.FOUR_TWO_FOUR.DISPLAY_NAME;
  }
  return perfume.name;
};
