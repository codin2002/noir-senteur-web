
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartCount } from '@/hooks/useCartCount';

interface Perfume {
  id: string;
  name: string;
  description: string;
  price: string;
  price_value: number;
  image: string;
  notes: string;
}

interface PerfumeActionsProps {
  perfume: Perfume;
  perfumeId: string;
  isInWishlist: boolean;
  setIsInWishlist: (value: boolean) => void;
}

const PerfumeActions: React.FC<PerfumeActionsProps> = ({ 
  perfume, 
  perfumeId, 
  isInWishlist, 
  setIsInWishlist 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const { refresh: refreshCartCount } = useCartCount(user?.id);

  const addToWishlist = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your wishlist');
      return;
    }

    if (!perfumeId) return;

    setAddingToWishlist(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('perfume_id', perfumeId);

        if (error) throw error;
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert([{ user_id: user.id, perfume_id: perfumeId }]);

        if (error) throw error;
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error('Failed to update wishlist', {
        description: error.message
      });
    } finally {
      setAddingToWishlist(false);
    }
  };

  const addToCart = async () => {
    if (!perfumeId || !perfume) return;

    setAddingToCart(true);
    try {
      if (user) {
        // For authenticated users, check for existing item and update quantity
        const { data: existingItem, error: checkError } = await supabase
          .from('cart')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('perfume_id', perfumeId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingItem) {
          // Update existing item quantity
          const { error: updateError } = await supabase
            .from('cart')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('id', existingItem.id);

          if (updateError) throw updateError;
          toast.success('Updated cart quantity');
        } else {
          // Add new item
          const { error: insertError } = await supabase
            .from('cart')
            .insert([{ user_id: user.id, perfume_id: perfumeId, quantity: 1 }]);

          if (insertError) throw insertError;
          toast.success('Added to cart');
        }
        
        refreshCartCount();
      } else {
        // For non-authenticated users, use localStorage with proper duplicate handling
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const existingItemIndex = cartItems.findIndex((item: any) => item.perfume.id === perfumeId);
        
        if (existingItemIndex > -1) {
          // Update quantity of existing item
          cartItems[existingItemIndex].quantity += 1;
          toast.success('Updated cart quantity');
        } else {
          // Add new item with proper structure
          const newItem = {
            id: `temp-${Date.now()}-${perfumeId}`,
            quantity: 1,
            perfume: {
              id: perfume.id,
              name: perfume.name,
              price: perfume.price,
              price_value: perfume.price_value,
              image: perfume.image,
              notes: perfume.notes
            }
          };
          cartItems.push(newItem);
          toast.success('Added to cart');
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        refreshCartCount();
      }

      // Redirect to cart page after successful addition
      navigate('/cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        description: error.message
      });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={addToCart}
        disabled={addingToCart}
        className="w-full bg-gold text-darker hover:bg-gold/80 text-lg py-6"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        {addingToCart ? 'Adding...' : 'Add to Cart'}
      </Button>
      
      <div className="grid grid-cols-1 gap-4">
        <Button 
          variant="outline"
          className={`border-gold/50 ${isInWishlist ? 'bg-gold/10 text-gold' : 'text-gold hover:bg-gold/10'}`}
          onClick={addToWishlist}
          disabled={addingToWishlist}
        >
          <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-gold stroke-gold' : ''}`} />
          {isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}
        </Button>
      </div>
    </div>
  );
};

export default PerfumeActions;
