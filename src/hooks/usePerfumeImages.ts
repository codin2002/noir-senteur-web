
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerfumeImage {
  id: string;
  perfume_id: string;
  image_url: string;
  display_order: number;
  alt_text: string | null;
  is_primary: boolean;
}

export const usePerfumeImages = (perfumeId: string) => {
  const [images, setImages] = useState<PerfumeImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('perfume_images')
          .select('*')
          .eq('perfume_id', perfumeId)
          .order('display_order', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setImages(data || []);
      } catch (error: any) {
        console.error('Error fetching perfume images:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (perfumeId) {
      fetchImages();
    }
  }, [perfumeId]);

  // Get image URLs array for easy use
  const imageUrls = images.map(img => img.image_url);
  
  // Get primary image or first image as fallback
  const primaryImage = images.find(img => img.is_primary)?.image_url || images[0]?.image_url;

  return {
    images,
    imageUrls,
    primaryImage,
    isLoading,
    error
  };
};
