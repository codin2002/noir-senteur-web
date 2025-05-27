
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const subscribeToNewsletter = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({ email });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast.error('This email is already subscribed to our newsletter');
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
      return false;
    }

    toast.success('Successfully subscribed to our newsletter!');
    return true;
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    toast.error('Failed to subscribe. Please try again.');
    return false;
  }
};
