
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PerfumeClassificationData } from '@/types/perfumeDetail';

export const fetchClassificationData = async (id: string): Promise<PerfumeClassificationData | null> => {
  if (!id) return null;
  
  console.log('Fetching classification data for perfume ID:', id);
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('User not authenticated, skipping classification data fetch');
      return null;
    }

    const { data, error } = await supabase
      .from('perfume_classifications')
      .select('*')
      .eq('perfume_id', id)
      .maybeSingle();

    console.log('Classification query result:', { data, error, searchingForId: id });
      
    if (error) {
      console.error('Error fetching classification data:', error);
      // Don't show toast for auth errors
      if (!error.message.includes('row-level security')) {
        toast.error('Failed to load classification data');
      }
      return null;
    }
    
    console.log('Successfully fetched classification data:', data);

    // If no data found, let's create sample data for this perfume
    if (!data) {
      console.log('No classification data found, creating sample data for perfume:', id);
      return await createSampleClassificationData(id);
    }

    return data;
  } catch (error) {
    console.error('Error fetching classification data:', error);
    return null;
  }
};

export const createSampleClassificationData = async (perfumeId: string): Promise<PerfumeClassificationData | null> => {
  try {
    // Check if user is authenticated before creating data
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('User not authenticated, cannot create sample classification data');
      return null;
    }

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
        audience_classic: 50,
        occasion_daily: 40,
        occasion_sport: 30,
        occasion_leisure: 60,
        occasion_night_out: 90,
        occasion_business: 50,
        occasion_evening: 90,
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
