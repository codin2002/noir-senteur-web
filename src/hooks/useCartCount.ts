
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItemType } from '@/components/cart/CartItem';

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
        // Calculate the total quantity of items in the cart
        const totalItems = data.reduce((sum, item: CartItemType) => sum + item.quantity, 0);
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
