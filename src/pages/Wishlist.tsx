
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import WishlistGrid from '@/components/wishlist/WishlistGrid';
import EmptyWishlist from '@/components/wishlist/EmptyWishlist';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NotSignedIn from '@/components/common/NotSignedIn';
import { useWishlist } from '@/hooks/useWishlist';

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistItems, isLoading, removeFromWishlist, addToCart } = useWishlist(user?.id);

  useEffect(() => {
    document.title = "Wishlist | Senteur Fragrances";
  }, []);

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
            <LoadingSpinner />
          ) : !user ? (
            <NotSignedIn message="Please sign in to view your wishlist" />
          ) : wishlistItems.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <WishlistGrid 
              items={wishlistItems} 
              onAddToCart={addToCart} 
              onRemoveFromWishlist={removeFromWishlist} 
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
