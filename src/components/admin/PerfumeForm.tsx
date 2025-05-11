
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader, X } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { createStorageBucket, getPublicUrl } from '@/lib/supabase';
import ResponsiveImage from '../common/ResponsiveImage';

const perfumeFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  notes: z.string().min(3, 'Notes are required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  price_value: z.number().min(0, 'Price value must be positive')
});

type PerfumeFormValues = z.infer<typeof perfumeFormSchema>;

const PerfumeForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<PerfumeFormValues>({
    resolver: zodResolver(perfumeFormSchema),
    defaultValues: {
      name: '',
      notes: '',
      description: '',
      price: '',
      price_value: 0
    }
  });

  // Initialize storage buckets
  React.useEffect(() => {
    createStorageBucket();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setUploadError('Only PNG, JPG and JPEG images are allowed');
        return;
      }

      setSelectedImage(file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadError(null);
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;
      
      // Upload the image to perfume1 bucket
      const { error: uploadError } = await supabase.storage
        .from('perfume1')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const publicUrl = getPublicUrl('perfume1', filePath);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Error uploading image');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: PerfumeFormValues) => {
    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image first
      const imageUrl = await uploadImage(selectedImage);
      
      // Then create perfume record
      const { error } = await supabase
        .from('perfumes')
        .insert({
          name: data.name,
          notes: data.notes,
          description: data.description,
          price: data.price,
          price_value: data.price_value,
          image: imageUrl
        });
      
      if (error) throw error;
      
      toast.success('Perfume added successfully');
      
      // Reset form
      form.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      
    } catch (error: any) {
      console.error('Error adding perfume:', error);
      toast.error(error.message || 'Error adding perfume');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Eau de Parfum" 
                      className="bg-darker border-gold/30 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Notes</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Bergamot, Rose, Vanilla" 
                      className="bg-darker border-gold/30 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Price Display</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="$250" 
                        className="bg-darker border-gold/30 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Price Value ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="250" 
                        className="bg-darker border-gold/30 text-white"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A luxurious blend of..." 
                      className="bg-darker border-gold/30 text-white h-40 resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="text-white block">Product Image</FormLabel>
              <div className="flex items-center justify-center w-full">
                {previewUrl ? (
                  <div className="relative w-full h-32 border-2 border-dashed rounded-lg border-gold/50 bg-darker/50 overflow-hidden">
                    <ResponsiveImage 
                      src={previewUrl} 
                      alt="Preview" 
                      objectFit="contain"
                      onError={() => setUploadError('Failed to load image preview')}
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="absolute top-1 right-1 bg-black/70 border-gold/30 text-white hover:bg-black/90"
                      onClick={resetImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label 
                    htmlFor="image-upload" 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
                    border-gray-600 bg-darker hover:bg-darker/70"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG or JPEG (max 5MB)</p>
                    </div>
                    <input 
                      id="image-upload" 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden" 
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
              {isUploading && (
                <div className="flex items-center justify-center mt-2">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="bg-gold hover:bg-gold/90 text-darker font-medium w-full md:w-auto"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" /> 
              <span className="ml-2">Adding Perfume...</span>
            </>
          ) : (
            'Add Perfume'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default PerfumeForm;
