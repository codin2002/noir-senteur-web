import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PerfumeClassification from '@/components/perfume/PerfumeClassification';
import PerfumeRatings from '@/components/perfume/PerfumeRatings';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Heart } from 'lucide-react';
import { PRICING } from '@/utils/constants';

interface Perfume {
  id: string;
  name: string;
  notes: string;
  description: string;
  image: string;
  price: string;
  price_value: number;
}

interface PerfumeClassificationData {
  id: string;
  perfume_id: string;
  type_floral: number;
  type_fresh: number;
  type_oriental: number;
  type_woody: number;
  occasion_casual: number;
  occasion_formal: number;
  occasion_evening: number;
  occasion_special: number;
  season_spring: number;
  season_summer: number;
  season_fall: number;
  season_winter: number;
  audience_feminine: number;
  audience_masculine: number;
  audience_unisex: number;
}

interface PerfumeRatingData {
  id: string;
  perfume_id: string;
  scent_rating: number;
  durability_rating: number;
  sillage_rating: number;
  bottle_rating: number;
  total_votes: number;
}

const PerfumeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [classificationData, setClassificationData] = useState<PerfumeClassificationData | null>(null);
  const [ratingsData, setRatingsData] = useState<PerfumeRatingData | null>(null);
  const [isLoadingClassification, setIsLoadingClassification] = useState(false);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
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

  // Check if item is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !id) return;
      
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', user.id)
          .eq('perfume_id', id);
          
        if (error) {
          throw error;
        }
        
        setIsInWishlist(data && data.length > 0);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };
    
    checkWishlist();
  }, [user, id]);

  const fetchClassificationData = async () => {
    if (!id) return;
    
    try {
      setIsLoadingClassification(true);
      
      const { data, error } = await supabase
        .from('perfume_classifications')
        .select('*')
        .eq('perfume_id', id)
        .single();
        
      if (error) {
        console.error('Error fetching classification data:', error);
        return;
      }
      
      if (data) {
        setClassificationData(data);
      }
    } catch (error) {
      console.error('Error fetching classification data:', error);
    } finally {
      setIsLoadingClassification(false);
    }
  };

  const fetchRatingsData = async () => {
    if (!id) return;
    
    try {
      setIsLoadingRatings(true);
      
      const { data, error } = await supabase
        .from('perfume_ratings')
        .select('*')
        .eq('perfume_id', id)
        .single();
        
      if (error) {
        console.error('Error fetching ratings data:', error);
        return;
      }
      
      if (data) {
        setRatingsData(data);
      }
    } catch (error) {
      console.error('Error fetching ratings data:', error);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const toggleExplore = () => {
    if (!showExplore) {
      // First-time opening, fetch data
      fetchClassificationData();
      fetchRatingsData();
    }
    
    setShowExplore(!showExplore);
  };

  const addToWishlist = async () => {
    if (!user) {
      // Store the redirect path for after login
      localStorage.setItem('auth_redirect_path', `/perfume/${id}`);
      navigate('/auth');
      return;
    }
    
    try {
      setAddingToWishlist(true);
      
      // Check if already in wishlist
      if (isInWishlist) {
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('perfume_id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Remove from wishlist
          const { error: deleteError } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', data.id);
            
          if (deleteError) throw deleteError;
          
          setIsInWishlist(false);
          toast.success('Removed from wishlist');
        }
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
    } finally {
      setAddingToWishlist(false);
    }
  };

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
          <LoadingSpinner size="md" />
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

  // Get the correct image URL based on the perfume name
  const getPerfumeImage = () => {
    if (perfume?.name === "Signature First") {
      return "/lovable-uploads/a9ced43b-497b-4733-9093-613c3f990036.png";
    }
    return perfume?.image;
  };

  // Display Arabic "313" for Signature First perfume
  const getDisplayName = () => {
    return perfume?.name === "Signature First" ? "٣١٣" : perfume?.name;
  };

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
                  src={getPerfumeImage()} 
                  alt={perfume.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Right - Details */}
            <div className="w-full lg:w-1/2 space-y-6 lg:pt-12">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-gold">{perfume.notes}</h3>
                <h1 className="text-4xl md:text-5xl font-serif mt-2">{getDisplayName()}</h1>
                <p className="text-2xl font-light text-gold mt-4">
                  {PRICING.CURRENCY_SYMBOL}{PRICING.PERFUME_PRICE}
                </p>
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
              
              <div className="pt-6 space-y-4">
                <Button 
                  className="w-full bg-gold text-darker hover:bg-gold/80"
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    className={`border-gold/50 ${isInWishlist ? 'bg-gold/10 text-gold' : 'text-gold hover:bg-gold/10'}`}
                    onClick={addToWishlist}
                    disabled={addingToWishlist}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-gold stroke-gold' : ''}`} />
                    {isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-gold/50 text-gold hover:bg-gold/10"
                    onClick={toggleExplore}
                  >
                    {showExplore ? 'Hide Details' : 'Explore'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Classification & Ratings */}
          {showExplore && (
            <div className="mt-16 border-t border-gold/30 pt-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="lg:border-r lg:border-gold/20 lg:pr-8">
                  <PerfumeClassification 
                    classificationData={classificationData}
                    isLoading={isLoadingClassification}
                  />
                </div>
                <div className="lg:pl-8">
                  <PerfumeRatings 
                    ratingsData={ratingsData}
                    isLoading={isLoadingRatings}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PerfumeDetail;
