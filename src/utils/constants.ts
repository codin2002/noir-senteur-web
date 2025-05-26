/**
 * Central storage for application constants
 */

// Pricing constants
export const PRICING = {
  PERFUME_PRICE: 100,
  CURRENCY: 'AED',
  CURRENCY_SYMBOL: 'AED ',
  SHIPPING_COST: 1,
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
  LUXURY_COLLECTION: {
    ID: "luxury-collection",
    NAME: "Luxury Collection",
    DISPLAY_NAME: "Luxury Collection",
    NOTES: "Rose, Jasmine, Sandalwood",
    DESCRIPTION: "An exquisite combination of rose and jasmine, with a rich sandalwood base that offers an elegant and refined sensory experience.",
    SHORT_DESCRIPTION: "Elegant floral notes with a rich sandalwood base.",
    // Images now fetched from database
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
