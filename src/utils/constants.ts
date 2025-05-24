
/**
 * Central storage for application constants
 */

// Pricing constants
export const PRICING = {
  PERFUME_PRICE: 100,
  CURRENCY: 'AED',
  CURRENCY_SYMBOL: 'AED ',
  SHIPPING_COST: 20,
};

// Perfume information constants
export const PERFUMES = {
  SIGNATURE_FIRST: {
    ID: "signature-first",
    NAME: "Signature First", 
    DISPLAY_NAME: "٣١٣", // Arabic "313"
    NOTES: "Amber, Oud, Vanilla",
    DESCRIPTION: "Our signature perfume with complex notes of amber and oud, finished with a touch of vanilla for a sophisticated, long-lasting aroma.",
    SHORT_DESCRIPTION: "A sophisticated blend of amber and oud with vanilla undertones.",
    IMAGE: "https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/perfume1//1stpic.jpg",
    IMAGES: [
      "https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/perfume1//1stpic.jpg",
      "https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/perfume1//2ndpic.jpg"
    ]
  },
  LUXURY_COLLECTION: {
    ID: "luxury-collection",
    NAME: "Luxury Collection",
    DISPLAY_NAME: "Luxury Collection",
    NOTES: "Rose, Jasmine, Sandalwood",
    DESCRIPTION: "An exquisite combination of rose and jasmine, with a rich sandalwood base that offers an elegant and refined sensory experience.",
    SHORT_DESCRIPTION: "Elegant floral notes with a rich sandalwood base.",
    IMAGE: "/lovable-uploads/8409f135-32ac-4937-ae90-9d2ad51131b5.png",
    IMAGES: ["/lovable-uploads/8409f135-32ac-4937-ae90-9d2ad51131b5.png"]
  }
};

/**
 * Helper function to get perfume display image based on name
 * @param perfume - Perfume object from database
 * @returns Correct image URL for the perfume
 */
export const getPerfumeImage = (perfume: { name: string, image: string }) => {
  if (perfume.name === PERFUMES.SIGNATURE_FIRST.NAME) {
    return PERFUMES.SIGNATURE_FIRST.IMAGE;
  }
  if (perfume.name === PERFUMES.LUXURY_COLLECTION.NAME) {
    return PERFUMES.LUXURY_COLLECTION.IMAGE;
  }
  return perfume.image;
};

/**
 * Helper function to get perfume images array
 * @param perfume - Perfume object from database
 * @returns Array of image URLs for the perfume
 */
export const getPerfumeImages = (perfume: { name: string, image: string }) => {
  if (perfume.name === PERFUMES.SIGNATURE_FIRST.NAME) {
    return PERFUMES.SIGNATURE_FIRST.IMAGES;
  }
  if (perfume.name === PERFUMES.LUXURY_COLLECTION.NAME) {
    return PERFUMES.LUXURY_COLLECTION.IMAGES;
  }
  return [perfume.image];
};

/**
 * Helper function to get perfume display name
 * @param perfume - Perfume object from database
 * @returns Correct display name for the perfume
 */
export const getPerfumeDisplayName = (perfume: { name: string }) => {
  if (perfume.name === PERFUMES.SIGNATURE_FIRST.NAME) {
    return PERFUMES.SIGNATURE_FIRST.DISPLAY_NAME;
  }
  return perfume.name;
};
