import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Perfume {
  id: string;
  name: string;
  notes: string;
  description: string;
  image: string;
  price: string;
  price_value: number;
}

interface WishlistItem {
  id: string;
  user_id: string;
  perfume_id: string;
  created_at: string;
  perfume: Perfume;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Wishlist | Senteur Fragrances";
    
    if (user) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      
      // Use the get_wishlist_with_perfumes RPC function
      const { data, error } = await supabase.rpc('get_wishlist_with_perfumes', {
        user_uuid: user?.id
      });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Convert the JSON data to the expected WishlistItem format
        const typedData = data.map(item => ({
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

  const addToCart = async (perfumeId: string) => {
    try {
      // Check if already in cart
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user?.id)
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
            user_id: user?.id,
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

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-serif mb-2">Wishlist</h1>
            <div className="w-24 h-0.5 bg-gold mx-auto"></div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          ) : !user ? (
            <div className="text-center py-12">
              <h2 className="text-xl mb-4">Please sign in to view your wishlist</h2>
              <Button 
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-darker"
                onClick={() => window.location.href = '/auth'}
              >
                Sign In
              </Button>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gold mb-4 opacity-50" />
              <h2 className="text-xl mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Add items to your wishlist to keep track of fragrances you love.</p>
              <Button 
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-darker"
                onClick={() => window.location.href = '/'}
              >
                Browse Collection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-darker border border-gold/20 rounded-lg overflow-hidden">
                  <div className="h-[240px] relative overflow-hidden">
                    <img 
                      src={item.perfume.image} 
                      alt={item.perfume.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm uppercase tracking-widest text-gold">{item.perfume.notes}</h3>
                    <h2 className="text-xl font-serif mb-2">{item.perfume.name}</h2>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {item.perfume.description}
                    </p>
                    <p className="text-lg font-light text-gold mb-4">{item.perfume.price}</p>
                    
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-gold text-darker hover:bg-gold/80"
                        onClick={() => addToCart(item.perfume.id)}
                      >
                        Add to Cart
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="border-red-500/50 hover:bg-red-500/10"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
