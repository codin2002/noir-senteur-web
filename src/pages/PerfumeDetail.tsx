
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Perfume {
  id: string;
  name: string;
  notes: string;
  description: string;
  image: string;
  price: string;
  price_value: number;
}

const PerfumeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfume = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('perfumes')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setPerfume(data);
          document.title = `${data.name} | Senteur Fragrances`;
        }
      } catch (error: any) {
        console.error('Error fetching perfume:', error);
        toast.error('Failed to load perfume details', {
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPerfume();
    }
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      // Store the redirect path for after login
      localStorage.setItem('auth_redirect_path', `/perfume/${id}`);
      navigate('/auth');
      return;
    }
    
    try {
      setAddingToCart(true);
      
      // Check if the item is already in the cart
      const { data: existingCartItems, error: checkError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('perfume_id', id);
        
      if (checkError) throw checkError;
      
      if (existingCartItems && existingCartItems.length > 0) {
        // Update quantity if already in cart
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: existingCartItems[0].quantity + 1 })
          .eq('id', existingCartItems[0].id);
          
        if (updateError) throw updateError;
        
        toast.success('Cart updated', {
          description: 'Item quantity increased in your cart'
        });
      } else {
        // Add new item to cart
        const { error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            perfume_id: id,
            quantity: 1
          });
          
        if (insertError) throw insertError;
        
        toast.success('Added to cart', {
          description: 'Item added to your cart successfully'
        });
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        description: error.message
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark text-white">
        <Navbar />
        <div className="pt-24 pb-12 flex justify-center items-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen bg-dark text-white">
        <Navbar />
        <div className="pt-24 pb-12 px-6 flex flex-col justify-center items-center min-h-[50vh]">
          <h2 className="text-3xl font-serif mb-4">Perfume Not Found</h2>
          <p className="text-muted-foreground mb-6">The perfume you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-darker"
            onClick={() => navigate('/')}
          >
            Back to Collection
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left - Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative h-[500px] lg:h-[700px] overflow-hidden rounded-lg">
                <img 
                  src={perfume.image} 
                  alt={perfume.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Right - Details */}
            <div className="w-full lg:w-1/2 space-y-6 lg:pt-12">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-gold">{perfume.notes}</h3>
                <h1 className="text-4xl md:text-5xl font-serif mt-2">{perfume.name}</h1>
                <p className="text-2xl font-light text-gold mt-4">{perfume.price}</p>
              </div>
              
              <div className="h-px bg-gold/30 w-full"></div>
              
              <div>
                <h3 className="text-xl font-serif mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {perfume.description}
                </p>
              </div>
              
              <div className="h-px bg-gold/30 w-full"></div>
              
              <div>
                <h3 className="text-xl font-serif mb-3">Notes</h3>
                <p className="text-muted-foreground">
                  {perfume.notes}
                </p>
              </div>
              
              <div className="pt-6">
                <Button 
                  className="w-full bg-gold text-darker hover:bg-gold/80"
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
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
