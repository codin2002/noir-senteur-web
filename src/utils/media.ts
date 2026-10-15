const STATIC_MEDIA_BY_STORAGE_PATH: Record<string, string> = {
  '/storage/v1/object/public/perfume1/313.PNG': '/images/collection-313-v2.jpg',
  '/storage/v1/object/public/perfume2/424.PNG': '/images/collection-424-v2.jpg',
};

/**
 * Serve the fixed product artwork from the website CDN instead of spending the
 * limited Supabase Storage egress allowance on every storefront visit.
 */
export const getOptimizedMediaUrl = (src?: string | null): string => {
  if (!src) return '';

  try {
    const url = new URL(src);
    return STATIC_MEDIA_BY_STORAGE_PATH[url.pathname] || src;
  } catch {
    return src;
  }
};
