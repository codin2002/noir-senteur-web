
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WishlistItemType } from '@/components/wishlist/WishlistItem';
import { Perfume } from '@/types/perfume';

export const useWishlist = (userId?: string) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch wishlist items
  const fetchWishlist = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the get_wishlist_with_perfumes RPC function
      const { data, error } = await supabase.rpc('get_wishlist_with_perfumes', {
        user_uuid: userId
      });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Convert the JSON data to the expected WishlistItem format
        const typedData = data.map((item: any) => ({
          ...item,
          perfume: item.perfume as unknown as Perfume
        }));
        setWishlistItems(typedData);
      } else {
        setWishlistItems([]);
      }
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setWishlistItems(wishlistItems.filter(item => item.id !== id));
      toast.success('Item removed from wishlist');
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist', {
        description: error.message
      });
    }
  };

  // Add item to cart
  const addToCart = async (perfumeId: string) => {
    if (!userId) return;
    
    try {
      // Check if already in cart
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .eq('perfume_id', perfumeId)
        .single();
        
      if (existingItem) {
        // Update quantity if already in cart
        const { error } = await supabase.rpc('update_cart_item', {
          cart_id: existingItem.id,
          new_quantity: existingItem.quantity + 1
        });
          
        if (error) throw error;
      } else {
        // Add new item to cart
        const { error } = await supabase
          .from('cart')
          .insert({
            user_id: userId,
            perfume_id: perfumeId,
            quantity: 1
          });
          
        if (error) throw error;
      }
      
      toast.success('Added to cart successfully');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        description: error.message
      });
    }
  };

  // Initialize
  useEffect(() => {
    fetchWishlist();
  }, [userId]);

  return {
    wishlistItems,
    isLoading,
    removeFromWishlist,
    addToCart
  };
};
