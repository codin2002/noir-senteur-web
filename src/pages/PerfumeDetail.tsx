import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, ArrowLeft, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PerfumeImageSlider from '@/components/perfume/PerfumeImageSlider';
import PerfumeClassification from '@/components/perfume/PerfumeClassification';
import PerfumeRatings from '@/components/perfume/PerfumeRatings';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCartCount } from '@/hooks/useCartCount';

interface PerfumeImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

interface PerfumeClassificationData {
  id: string;
  perfume_id: string;
  type_floral: number;
  type_fresh: number;
  type_oriental: number;
  type_woody: number;
  audience_masculine: number;
  audience_feminine: number;
  audience_unisex: number;
  occasion_casual: number;
  occasion_formal: number;
  occasion_evening: number;
  occasion_special: number;
  season_spring: number;
  season_summer: number;
  season_fall: number;
  season_winter: number;
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

interface Perfume {
  id: string;
  name: string;
  description: string;
  price: string;
  price_value: number;
  image: string;
  notes: string;
}

const PerfumeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [perfumeImages, setPerfumeImages] = useState<PerfumeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [classificationData, setClassificationData] = useState<PerfumeClassificationData | null>(null);
  const [ratingsData, setRatingsData] = useState<PerfumeRatingData | null>(null);
  const [isLoadingClassification, setIsLoadingClassification] = useState(false);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const { refresh: refreshCartCount } = useCartCount(user?.id);

  // Add debug log for the id parameter
  console.log('Perfume ID from params:', id);

  useEffect(() => {
    if (id) {
      fetchPerfume();
      fetchPerfumeImages();
      if (user) {
        checkWishlistStatus();
      }
    }
  }, [id, user]);

  useEffect(() => {
    document.title = perfume ? `${perfume.name} | Senteur Fragrances` : "Perfume Details | Senteur Fragrances";
  }, [perfume]);

  const fetchPerfume = async () => {
    try {
      console.log('Fetching perfume with ID:', id);
      const { data, error } = await supabase
        .from('perfumes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPerfume(data);
    } catch (error: any) {
      console.error('Error fetching perfume:', error);
      toast.error('Failed to load perfume details', {
        description: error.message
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfumeImages = async () => {
    try {
      console.log('Fetching images for perfume ID:', id);
      const { data, error } = await supabase
        .from('perfume_images')
        .select('*')
        .eq('perfume_id', id)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching perfume images:', error);
        return;
      }

      setPerfumeImages(data || []);
    } catch (error) {
      console.error('Error fetching perfume images:', error);
    }
  };

  const fetchClassificationData = async () => {
    if (!id) return;
    
    console.log('Fetching classification data for perfume ID:', id);
    setIsLoadingClassification(true);
    try {
      const { data, error } = await supabase
        .from('perfume_classifications')
        .select('*')
        .eq('perfume_id', id);
        
      if (error) {
        console.error('Error fetching classification data:', error);
        toast.error('Failed to load classification data', {
          description: error.message
        });
        return;
      }
      
      console.log('Classification data response:', data);
      // Take the first result if any exist
      setClassificationData(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching classification data:', error);
      setClassificationData(null);
    } finally {
      setIsLoadingClassification(false);
    }
  };

  const fetchRatingsData = async () => {
    if (!id) return;
    
    console.log('Fetching ratings data for perfume ID:', id);
    setIsLoadingRatings(true);
    try {
      const { data, error } = await supabase
        .from('perfume_ratings')
        .select('*')
        .eq('perfume_id', id);
        
      if (error) {
        console.error('Error fetching ratings data:', error);
        toast.error('Failed to load ratings data', {
          description: error.message
        });
        return;
      }
      
      console.log('Ratings data response:', data);
      // Take the first result if any exist
      setRatingsData(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching ratings data:', error);
      setRatingsData(null);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  // Fetch classification and ratings data when component mounts
  useEffect(() => {
    if (id) {
      fetchClassificationData();
      fetchRatingsData();
    }
  }, [id]);

  const addToWishlist = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your wishlist');
      return;
    }

    if (!id) return;

    setAddingToWishlist(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('perfume_id', id);

        if (error) throw error;
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert([{ user_id: user.id, perfume_id: id }]);

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

  const checkWishlistStatus = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('perfume_id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking wishlist status:', error);
        return;
      }

      setIsInWishlist(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const addToCart = async () => {
    if (!id || !perfume) return;

    setAddingToCart(true);
    try {
      if (user) {
        // For authenticated users, check for existing item and update quantity
        const { data: existingItem, error: checkError } = await supabase
          .from('cart')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('perfume_id', id)
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
            .insert([{ user_id: user.id, perfume_id: id, quantity: 1 }]);

          if (insertError) throw insertError;
          toast.success('Added to cart');
        }
        
        refreshCartCount();
      } else {
        // For non-authenticated users, use localStorage with proper duplicate handling
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const existingItemIndex = cartItems.findIndex((item: any) => item.perfume.id === id);
        
        if (existingItemIndex > -1) {
          // Update quantity of existing item
          cartItems[existingItemIndex].quantity += 1;
          toast.success('Updated cart quantity');
        } else {
          // Add new item with proper structure
          const newItem = {
            id: `temp-${Date.now()}-${id}`, // More unique ID that includes perfume ID
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

  const refreshAnalytics = () => {
    fetchClassificationData();
    fetchRatingsData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-6 flex items-center justify-center">
          <LoadingSpinner />
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
            <h1 className="text-2xl font-serif mb-4">Perfume Not Found</h1>
            <Button onClick={() => navigate('/')} className="bg-gold text-darker hover:bg-gold/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
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
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mb-6 text-gold hover:text-gold/80 hover:bg-gold/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collection
          </Button>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-6">
              <PerfumeImageSlider 
                images={perfumeImages} 
                perfumeName={perfume.name}
                fallbackImage={perfume.image}
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-4">{perfume.name}</h1>
                <div className="text-2xl font-bold text-gold mb-6">{perfume.price}</div>
                <p className="text-gray-300 leading-relaxed mb-6">{perfume.description}</p>
                
                {perfume.notes && (
                  <div className="border-t border-gold/30 pt-6">
                    <h3 className="font-semibold mb-3 text-gold">Notes</h3>
                    <p className="text-gray-300">{perfume.notes}</p>
                  </div>
                )}
              </div>

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
            </div>
          </div>
          
          {/* Classification & Ratings - Always show section */}
          <div className="mt-16 border-t border-gold/30 pt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">Perfume Analytics</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAnalytics}
                className="border-gold/50 text-gold hover:bg-gold/10"
                disabled={isLoadingClassification || isLoadingRatings}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingClassification || isLoadingRatings ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <PerfumeClassification 
                classificationData={classificationData} 
                isLoading={isLoadingClassification}
              />
              <PerfumeRatings 
                ratingsData={ratingsData} 
                isLoading={isLoadingRatings}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PerfumeDetail;
