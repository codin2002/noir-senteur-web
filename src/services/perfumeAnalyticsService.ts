
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PerfumeClassificationData, PerfumeRatingData } from '@/types/perfumeDetail';

export const fetchClassificationData = async (id: string): Promise<PerfumeClassificationData | null> => {
  if (!id) return null;
  
  console.log('Fetching classification data for perfume ID:', id);
  
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
      return null;
    }
    
    console.log('Successfully fetched classification data:', data);

    // If no data found, let's create sample data for this perfume
    if (!data && allPerfumes?.find(p => p.id === id)) {
      console.log('No classification data found, creating sample data for perfume:', id);
      return await createSampleClassificationData(id);
    }

    return data;
  } catch (error) {
    console.error('Error fetching classification data:', error);
    return null;
  }
};

export const fetchRatingsData = async (id: string): Promise<PerfumeRatingData | null> => {
  if (!id) return null;
  
  console.log('Fetching ratings data for perfume ID:', id);
  
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
      return null;
    }
    
    console.log('Successfully fetched ratings data:', data);

    // If no data found, let's create sample data for this perfume
    if (!data) {
      console.log('No ratings data found, creating sample data for perfume:', id);
      return await createSampleRatingsData(id);
    }

    return data;
  } catch (error) {
    console.error('Error fetching ratings data:', error);
    return null;
  }
};

export const createSampleClassificationData = async (perfumeId: string): Promise<PerfumeClassificationData | null> => {
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
      return null;
    }

    console.log('Created sample classification data:', data);
    toast.success('Sample classification data created');
    return data;
  } catch (error) {
    console.error('Error creating sample classification data:', error);
    return null;
  }
};

export const createSampleRatingsData = async (perfumeId: string): Promise<PerfumeRatingData | null> => {
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
      return null;
    }

    console.log('Created sample ratings data:', data);
    toast.success('Sample ratings data created');
    return data;
  } catch (error) {
    console.error('Error creating sample ratings data:', error);
    return null;
  }
};
