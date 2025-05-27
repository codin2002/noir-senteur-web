
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Perfume, PerfumeImage, PerfumeClassificationData, PerfumeRatingData } from '@/types/perfumeDetail';

export const fetchPerfume = async (id: string): Promise<Perfume | null> => {
  if (!id) {
    console.error('No perfume ID provided');
    return null;
  }

  console.log('Fetching perfume with ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('perfumes')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Perfume query result:', { data, error });

    if (error) {
      console.error('Error fetching perfume:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No perfume found with ID:', id);
      return null;
    }

    console.log('Successfully fetched perfume:', data);
    return data;
  } catch (error: any) {
    console.error('Error in fetchPerfume:', error);
    toast.error('Failed to load perfume details', {
      description: error.message
    });
    return null;
  }
};

export const fetchPerfumeImages = async (id: string): Promise<PerfumeImage[]> => {
  if (!id) return [];

  console.log('Fetching images for perfume ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('perfume_images')
      .select('*')
      .eq('perfume_id', id)
      .order('display_order', { ascending: true });

    console.log('Images query result:', { data, error });

    if (error) {
      console.error('Error fetching perfume images:', error);
      return [];
    }

    console.log('Successfully fetched images:', data?.length || 0, 'images');
    return data || [];
  } catch (error) {
    console.error('Error fetching perfume images:', error);
    return [];
  }
};

export const checkWishlistStatus = async (userId: string, perfumeId: string): Promise<boolean> => {
  if (!userId || !perfumeId) return false;

  console.log('Checking wishlist status for user:', userId, 'perfume:', perfumeId);

  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('perfume_id', perfumeId)
      .single();

    console.log('Wishlist query result:', { data, error });

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking wishlist status:', error);
      return false;
    }

    const inWishlist = !!data;
    console.log('Wishlist status:', inWishlist);
    return inWishlist;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }
};
