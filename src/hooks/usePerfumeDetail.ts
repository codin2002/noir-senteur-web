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

  console.log('usePerfumeDetail - ID from params:', id);
  console.log('usePerfumeDetail - User:', user);

  const fetchPerfume = async () => {
    if (!id) {
      console.error('No perfume ID provided');
      setLoading(false);
      return;
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
        setPerfume(null);
        return;
      }

      console.log('Successfully fetched perfume:', data);
      setPerfume(data);
    } catch (error: any) {
      console.error('Error in fetchPerfume:', error);
      toast.error('Failed to load perfume details', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfumeImages = async () => {
    if (!id) return;

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
        return;
      }

      setPerfumeImages(data || []);
      console.log('Successfully fetched images:', data?.length || 0, 'images');
    } catch (error) {
      console.error('Error fetching perfume images:', error);
    }
  };

  const fetchClassificationData = async () => {
    if (!id) return;
    
    console.log('Fetching classification data for perfume ID:', id);
    setIsLoadingClassification(true);
    
    try {
      // First check what perfume IDs exist in the perfumes table
      const { data: allPerfumes, error: perfumesError } = await supabase
        .from('perfumes')
        .select('id, name');

      console.log('All perfumes in database:', allPerfumes);

      // Check what classification data exists
      const { data: allClassifications, error: allError } = await supabase
        .from('perfume_classifications')
        .select('perfume_id, id');

      console.log('All classifications in database:', allClassifications);

      const { data, error } = await supabase
        .from('perfume_classifications')
        .select('*')
        .eq('perfume_id', id)
        .maybeSingle();

      console.log('Classification query result:', { data, error, searchingForId: id });
        
      if (error) {
        console.error('Error fetching classification data:', error);
        toast.error('Failed to load classification data');
        return;
      }
      
      setClassificationData(data);
      console.log('Successfully fetched classification data:', data);

      // If no data found, let's create sample data for this perfume
      if (!data && allPerfumes?.find(p => p.id === id)) {
        console.log('No classification data found, creating sample data for perfume:', id);
        await createSampleClassificationData(id);
      }
    } catch (error) {
      console.error('Error fetching classification data:', error);
      setClassificationData(null);
    } finally {
      setIsLoadingClassification(false);
    }
  };

  const fetchRatingsData = async () => {
    if (!id) return;
    
    console.log('Fetching ratings data for perfume ID:', id);
    setIsLoadingRatings(true);
    
    try {
      // Check what ratings data exists
      const { data: allRatings, error: allError } = await supabase
        .from('perfume_ratings')
        .select('perfume_id, id');

      console.log('All ratings in database:', allRatings);

      const { data, error } = await supabase
        .from('perfume_ratings')
        .select('*')
        .eq('perfume_id', id)
        .maybeSingle();

      console.log('Ratings query result:', { data, error, searchingForId: id });
        
      if (error) {
        console.error('Error fetching ratings data:', error);
        toast.error('Failed to load ratings data');
        return;
      }
      
      setRatingsData(data);
      console.log('Successfully fetched ratings data:', data);

      // If no data found, let's create sample data for this perfume
      if (!data) {
        console.log('No ratings data found, creating sample data for perfume:', id);
        await createSampleRatingsData(id);
      }
    } catch (error) {
      console.error('Error fetching ratings data:', error);
      setRatingsData(null);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const createSampleClassificationData = async (perfumeId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfume_classifications')
        .insert({
          perfume_id: perfumeId,
          type_floral: 25,
          type_fresh: 20,
          type_oriental: 85,
          type_woody: 75,
          audience_masculine: 70,
          audience_feminine: 30,
          audience_unisex: 60,
          occasion_casual: 40,
          occasion_formal: 60,
          occasion_evening: 90,
          occasion_special: 85,
          season_spring: 35,
          season_summer: 25,
          season_fall: 85,
          season_winter: 90
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating sample classification data:', error);
        return;
      }

      console.log('Created sample classification data:', data);
      setClassificationData(data);
      toast.success('Sample classification data created');
    } catch (error) {
      console.error('Error creating sample classification data:', error);
    }
  };

  const createSampleRatingsData = async (perfumeId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfume_ratings')
        .insert({
          perfume_id: perfumeId,
          scent_rating: 85,
          durability_rating: 78,
          sillage_rating: 82,
          bottle_rating: 75,
          total_votes: 2508
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating sample ratings data:', error);
        return;
      }

      console.log('Created sample ratings data:', data);
      setRatingsData(data);
      toast.success('Sample ratings data created');
    } catch (error) {
      console.error('Error creating sample ratings data:', error);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !id) return;

    console.log('Checking wishlist status for user:', user.id, 'perfume:', id);

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('perfume_id', id)
        .single();

      console.log('Wishlist query result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking wishlist status:', error);
        return;
      }

      const inWishlist = !!data;
      setIsInWishlist(inWishlist);
      console.log('Wishlist status:', inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const refreshAnalytics = () => {
    console.log('Refreshing analytics data');
    fetchClassificationData();
    fetchRatingsData();
  };

  useEffect(() => {
    console.log('Effect triggered - ID:', id, 'User:', user?.id);
    
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
