
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface PerfumeImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

interface PerfumeClassificationData {
  id: string;
  perfume_id: string;
  type_floral: number;
  type_fresh: number;
  type_oriental: number;
  type_woody: number;
  audience_masculine: number;
  audience_feminine: number;
  audience_unisex: number;
  occasion_casual: number;
  occasion_formal: number;
  occasion_evening: number;
  occasion_special: number;
  season_spring: number;
  season_summer: number;
  season_fall: number;
  season_winter: number;
}

interface PerfumeRatingData {
  id: string;
  perfume_id: string;
  scent_rating: number;
  durability_rating: number;
  sillage_rating: number;
  bottle_rating: number;
  total_votes: number;
}

interface Perfume {
  id: string;
  name: string;
  description: string;
  price: string;
  price_value: number;
  image: string;
  notes: string;
}

export const usePerfumeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [perfumeImages, setPerfumeImages] = useState<PerfumeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [classificationData, setClassificationData] = useState<PerfumeClassificationData | null>(null);
  const [ratingsData, setRatingsData] = useState<PerfumeRatingData | null>(null);
  const [isLoadingClassification, setIsLoadingClassification] = useState(false);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  const fetchPerfume = async () => {
    try {
      const { data, error } = await supabase
        .from('perfumes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPerfume(data);
    } catch (error: any) {
      console.error('Error fetching perfume:', error);
      toast.error('Failed to load perfume details', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfumeImages = async () => {
    try {
      const { data, error } = await supabase
        .from('perfume_images')
        .select('*')
        .eq('perfume_id', id)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching perfume images:', error);
        return;
      }

      setPerfumeImages(data || []);
    } catch (error) {
      console.error('Error fetching perfume images:', error);
    }
  };

  const fetchClassificationData = async () => {
    if (!id) return;
    
    setIsLoadingClassification(true);
    try {
      const { data, error } = await supabase
        .from('perfume_classifications')
        .select('*')
        .eq('perfume_id', id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching classification data:', error);
        toast.error('Failed to load classification data');
        return;
      }
      
      setClassificationData(data);
    } catch (error) {
      console.error('Error fetching classification data:', error);
      setClassificationData(null);
    } finally {
      setIsLoadingClassification(false);
    }
  };

  const fetchRatingsData = async () => {
    if (!id) return;
    
    setIsLoadingRatings(true);
    try {
      const { data, error } = await supabase
        .from('perfume_ratings')
        .select('*')
        .eq('perfume_id', id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching ratings data:', error);
        toast.error('Failed to load ratings data');
        return;
      }
      
      setRatingsData(data);
    } catch (error) {
      console.error('Error fetching ratings data:', error);
      setRatingsData(null);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('perfume_id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking wishlist status:', error);
        return;
      }

      setIsInWishlist(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const refreshAnalytics = () => {
    fetchClassificationData();
    fetchRatingsData();
  };

  useEffect(() => {
    if (id) {
      fetchPerfume();
      fetchPerfumeImages();
      if (user) {
        checkWishlistStatus();
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      fetchClassificationData();
      fetchRatingsData();
    }
  }, [id]);

  useEffect(() => {
    document.title = perfume ? `${perfume.name} | Senteur Fragrances` : "Perfume Details | Senteur Fragrances";
  }, [perfume]);

  return {
    id,
    perfume,
    perfumeImages,
    loading,
    isInWishlist,
    setIsInWishlist,
    classificationData,
    ratingsData,
    isLoadingClassification,
    isLoadingRatings,
    refreshAnalytics
  };
};
