
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
    
    // Also ensure perfume1 bucket exists (for backwards compatibility)
    const perfume1Bucket = buckets?.find(bucket => bucket.name === 'perfume1');
    if (!perfume1Bucket) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket('perfume1', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) throw error;
      console.log('Perfume1 bucket created successfully');
    }
  } catch (error) {
    console.error('Error creating storage bucket:', error);
  }
};

// Helper function to get public URL for a file in a bucket
export const getPublicUrl = (bucketName: string, filePath: string) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};
