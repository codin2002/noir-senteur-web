import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CartItem, { CartItemType } from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import CartEmpty from '@/components/cart/CartEmpty';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { useCartCount } from '@/hooks/useCartCount';

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ address: string }>({ address: '' });
  const { user } = useAuth();
  const { refresh: refreshCartCount } = useCartCount(user?.id);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Shopping Cart | Senteur Fragrances";
    
    // Check for payment status in URL
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment completed successfully!', {
        description: 'Your order has been confirmed.'
      });
      // Clear cart after successful payment
      setCartItems([]);
      refreshCartCount();
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled', {
        description: 'Your cart items are still saved.'
      });
    }
    
    if (user) {
      fetchCart();
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user, searchParams]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      
      // Use the stored procedure to get cart items with their associated perfumes
      const { data, error } = await supabase.rpc('get_cart_with_perfumes', {
        user_uuid: user?.id
      });
      
      if (error) throw error;
      
      if (data) {
        // Convert the JSON data to the expected CartItemType format
        const typedData = data.map(item => ({
          ...item,
          perfume: item.perfume as unknown as CartItemType['perfume']
        }));
        
        setCartItems(typedData);
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

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      
      setUserProfile({ address: data?.address || '' });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
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

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async (
    addressType: 'home', 
    deliveryAddress: string
  ) => {
    // The payment processing is now handled in CheckoutModal
    // This function is called after successful payment redirect
    console.log('Checkout confirmed with:', { addressType, deliveryAddress });
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => 
      sum + (item.perfume.price_value * item.quantity), 0
    );
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-serif mb-2">Shopping Cart</h1>
            <div className="w-24 h-0.5 bg-gold mx-auto"></div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          ) : !user ? (
            <CartEmpty isAuthenticated={false} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart items */}
              <div className="flex-grow">
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <CartItem 
                        key={item.id} 
                        item={item} 
                        onItemUpdate={handleUpdateItem}
                        onItemRemove={handleRemoveItem}
                        refreshCartCount={refreshCartCount}
                      />
                    ))}
                  </div>
                ) : (
                  <CartEmpty isAuthenticated={true} />
                )}
              </div>
              
              {/* Order summary - Always show for authenticated users */}
              {user && (
                <div className="lg:w-1/3">
                  <CartSummary 
                    cartItems={cartItems} 
                    onCheckout={handleCheckoutClick}
                    currencySymbol="AED "
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        userAddress={userProfile.address}
        onConfirmCheckout={handleConfirmCheckout}
        currencySymbol="AED "
      />
    </div>
  );
};

export default Cart;
