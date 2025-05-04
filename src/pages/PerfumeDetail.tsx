
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Perfume {
  id: string;
  name: string;
  notes: string;
  description: string;
  detailed_description?: string;
  image: string;
  price: string;
  price_value: number;
}

const PerfumeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPerfume();
    if (user) {
      checkWishlistStatus();
    }
  }, [id, user]);

  const fetchPerfume = async () => {
    try {
      setIsLoading(true);
      
      if (!id) return;
      
      const { data, error } = await supabase
        .from('perfumes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setPerfume(data);
      document.title = `${data.name} | Senteur Fragrances`;
    } catch (error: any) {
      console.error('Error fetching perfume details:', error);
      toast.error('Failed to load perfume details', {
        description: error.message
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      if (!id || !user) return;
      
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('perfume_id', id)
        .single();
        
      setIsInWishlist(!!data);
    } catch (error) {
      // Not in wishlist - this is fine, we'll just show "Add to Wishlist" option
      setIsInWishlist(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      if (!user) {
        toast('Please sign in', {
          description: 'You need to be signed in to add items to your wishlist',
          action: {
            label: 'Sign In',
            onClick: () => navigate('/auth')
          }
        });
        return;
      }
      
      if (isInWishlist) {
        // Remove from wishlist
        const { data, error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('perfume_id', id)
          .select();
          
        if (error) throw error;
        
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            perfume_id: id
          });
          
        if (error) throw error;
        
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist', {
        description: error.message
      });
    }
  };

  const addToCart = async () => {
    try {
      if (!user) {
        toast('Please sign in', {
          description: 'You need to be signed in to add items to your cart',
          action: {
            label: 'Sign In',
            onClick: () => navigate('/auth')
          }
        });
        return;
      }
      
      // Check if already in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('perfume_id', id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingItem) {
        // Update quantity if already in cart
        const newQuantity = existingItem.quantity + quantity;
        const { error } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);
          
        if (error) throw error;
        
        toast.success('Cart updated', {
          description: `${perfume?.name} quantity increased to ${newQuantity}`
        });
      } else {
        // Add new item to cart
        const { error } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            perfume_id: id,
            quantity: quantity
          });
          
        if (error) throw error;
        
        toast.success('Added to cart', {
          description: `${perfume?.name} added to your cart`
        });
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        description: error.message
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-6 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-4">Perfume not found</h2>
            <Button
              variant="outline"
              className="border-gold text-gold hover:bg-gold hover:text-darker"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Image section */}
            <div className="w-full lg:w-1/2">
              <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-lg">
                <img 
                  src={perfume.image} 
                  alt={perfume.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Details section */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-gold mb-2">{perfume.notes}</h3>
                <h1 className="text-4xl md:text-5xl font-serif mb-4">{perfume.name}</h1>
                <p className="text-2xl font-light text-gold">{perfume.price}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-serif">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {perfume.detailed_description || perfume.description}
                </p>
              </div>
              
              <div className="pt-4 space-y-6">
                <div className="flex space-x-4 items-center">
                  <div className="flex border border-gold/30 rounded-md">
                    <Button
                      variant="ghost"
                      className="px-3 text-gold hover:bg-gold/10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <div className="w-12 flex items-center justify-center text-lg">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      className="px-3 text-gold hover:bg-gold/10"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  
                  <Button 
                    className="bg-gold text-darker hover:bg-gold/80 flex-1"
                    onClick={addToCart}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className={isInWishlist ? 
                      "border-gold bg-gold/10 text-gold" : 
                      "border-gold/50 hover:bg-gold/10"
                    }
                    onClick={toggleWishlist}
                  >
                    <Heart className="h-5 w-5" fill={isInWishlist ? "currentColor" : "none"} />
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Free shipping on orders over $100</p>
                  <p>30-day returns for unopened products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PerfumeDetail;
