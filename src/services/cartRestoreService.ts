
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from "sonner";

export const cartRestoreService = {
  async restoreCartFromLocalStorage(userId: string) {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      if (cartItems.length > 0) {
        console.log('Restoring cart items from localStorage:', cartItems);
        
        // First, get existing cart items to avoid duplicates
        const { data: existingItems, error: fetchError } = await supabase.rpc('get_cart_with_perfumes', {
          user_uuid: userId
        });
        
        if (fetchError) {
          console.error('Error fetching existing cart:', fetchError);
          return;
        }
        
        const existingPerfumeIds = new Set(existingItems?.map(item => item.perfume_id) || []);
        
        // Only add items that don't already exist in the database cart
        const newItems = cartItems.filter(item => !existingPerfumeIds.has(item.perfume.id));
        
        if (newItems.length > 0) {
          for (const item of newItems) {
            await supabase
              .from('cart')
              .insert({
                user_id: userId,
                perfume_id: item.perfume.id,
                quantity: item.quantity
              });
          }
          
          sonnerToast.success('Cart restored', {
            description: `${newItems.length} new item(s) restored to your cart`
          });
        } else if (existingItems && existingItems.length > 0) {
          // If no new items but existing items found, still show a message
          sonnerToast.success('Cart loaded', {
            description: `${existingItems.length} item(s) in your cart`
          });
        }
        
        // Clear localStorage after processing
        localStorage.removeItem('cartItems');
        
        // Trigger cart update event to refresh UI
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Error restoring cart:', error);
    }
  }
};
