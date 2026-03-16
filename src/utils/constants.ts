/**
 * Central storage for application constants
 */

// Pricing constants
export const PRICING = {
  PERFUME_PRICE: 100,
  CURRENCY: 'AED',
  CURRENCY_SYMBOL: 'AED ',
  SHIPPING_COST: 4.99,
};

// Perfume information constants
export const PERFUMES = {
  THREE_ONE_THREE: {
    ID: "313",
    NAME: "٣١٣", // Changed to match database Arabic name
    DISPLAY_NAME: "٣١٣", // Arabic "313"
    NOTES: "Amber, Oud, Vanilla",
    DESCRIPTION: "Our signature perfume with complex notes of amber and oud, finished with a touch of vanilla for a sophisticated, long-lasting aroma.",
    SHORT_DESCRIPTION: "A sophisticated blend of amber and oud with vanilla undertones.",
    // Images now fetched from database
  },
  FOUR_TWO_FOUR: {
    ID: "424",
    NAME: "٤٢٤",
    DISPLAY_NAME: "٤٢٤",
    NOTES: "Amber, Oud, Cashmere",
    DESCRIPTION: "٤٢٤ starts off with a slight warm and spicy nutmeg scent and then the middle note is carried forward by a fresh violet flower and then the most interesting part of a perfume is the base note which is Amber, oud and cashmere",
    SHORT_DESCRIPTION: "A warm and spicy blend with amber, oud and cashmere.",
  }
};

/**
 * Helper function to get perfume display name
 * @param perfume - Perfume object from database
 * @returns Correct display name for the perfume
 */
export const getPerfumeDisplayName = (perfume: { name: string }) => {
  if (perfume.name === PERFUMES.THREE_ONE_THREE.NAME) {
    return PERFUMES.THREE_ONE_THREE.DISPLAY_NAME;
  }
  return perfume.name;
};
