
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CartItemType } from '@/components/cart/CartItem';
import { cleanupCartStorage, removeDuplicateCartItems } from '@/utils/cartUtils';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const loadCartFromLocalStorage = () => {
    try {
      setIsLoading(true);
      const cleanedCartItems = cleanupCartStorage();
      setCartItems(cleanedCartItems);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('get_cart_with_perfumes', {
        user_uuid: user?.id
      });
      
      if (error) throw error;
      
      if (data) {
        const typedData = data.map(item => ({
          ...item,
          perfume: item.perfume as unknown as CartItemType['perfume']
        }));
        
        const duplicateGroups = typedData.reduce((acc, item) => {
          const perfumeId = item.perfume.id;
          if (!acc[perfumeId]) acc[perfumeId] = [];
          acc[perfumeId].push(item);
          return acc;
        }, {} as { [key: string]: CartItemType[] });
        
        const hasDuplicates = Object.values(duplicateGroups).some(group => group.length > 1);
        
        if (hasDuplicates) {
          console.log('Duplicate cart items detected, cleaning up...');
          await removeDuplicateCartItems(supabase, user?.id, typedData);
          
          const { data: cleanedData, error: refetchError } = await supabase.rpc('get_cart_with_perfumes', {
            user_uuid: user?.id
          });
          
          if (refetchError) throw refetchError;
          
          const cleanedTypedData = cleanedData?.map(item => ({
            ...item,
            perfume: item.perfume as unknown as CartItemType['perfume']
          })) || [];
          
          setCartItems(cleanedTypedData);
          toast.success('Cart updated', {
            description: 'Duplicate items have been merged'
          });
        } else {
          setCartItems(typedData);
        }
      } else {
        setCartItems([]);
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = (updatedItem: CartItemType) => {
    setCartItems(cartItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return {
    cartItems,
    isLoading,
    setCartItems,
    loadCartFromLocalStorage,
    fetchCart,
    handleUpdateItem,
    handleRemoveItem,
    searchParams
  };
};
