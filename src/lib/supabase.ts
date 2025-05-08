
import { supabase } from '@/integrations/supabase/client';

export const createStorageBucket = async () => {
  try {
    // Check if the perfumes bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const perfumesBucket = buckets?.find(bucket => bucket.name === 'perfumes');
    
    if (!perfumesBucket) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket('perfumes', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) throw error;
      console.log('Perfumes bucket created successfully');
    }
  } catch (error) {
    console.error('Error creating storage bucket:', error);
  }
};
