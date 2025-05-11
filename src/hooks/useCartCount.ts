
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Perfume } from '@/types/perfume';

// Define the type for the data returned by the get_cart_with_perfumes RPC
interface CartItemFromDB {
  id: string;
  user_id: string;
  perfume_id: string;
  quantity: number;
  created_at: string;
  perfume: Perfume;
}

export const useCartCount = (userId?: string) => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCartCount = async () => {
    if (!userId) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the get_cart_with_perfumes RPC function
      const { data, error } = await supabase.rpc('get_cart_with_perfumes', {
        user_uuid: userId
      });
      
      if (error) {
        throw error;
      }
      
      if (data && Array.isArray(data)) {
        // Type-safe cast for the data returned from DB
        const cartItems = data as unknown as CartItemFromDB[];
        
        // Calculate the total quantity of items in the cart
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCount(totalItems);
      } else {
        setCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [userId]);

  return {
    count,
    isLoading,
    refresh: fetchCartCount
  };
};
