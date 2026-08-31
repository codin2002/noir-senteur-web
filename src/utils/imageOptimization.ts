const SUPABASE_PUBLIC_IMAGE_PATH = '/storage/v1/object/public/';
const SUPABASE_RENDER_IMAGE_PATH = '/storage/v1/render/image/public/';

/**
 * Product cards only need a compact display image. Supabase's render endpoint
 * serves a right-sized image and returns WebP automatically to browsers that
 * support it, while the original stays untouched for full product views.
 */
export const getOptimizedProductImageUrl = (source: string, width = 640) => {
  if (!source?.includes(SUPABASE_PUBLIC_IMAGE_PATH)) return source;

  const [path, existingQuery = ''] = source.split('?');
  const transformedPath = path.replace(SUPABASE_PUBLIC_IMAGE_PATH, SUPABASE_RENDER_IMAGE_PATH);
  const params = new URLSearchParams(existingQuery);
  params.set('width', String(width));
  params.set('quality', '70');
  params.set('resize', 'contain');

  return `${transformedPath}?${params.toString()}`;
};
