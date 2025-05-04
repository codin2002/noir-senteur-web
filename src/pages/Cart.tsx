
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CartItem, { CartItemType } from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import CartEmpty from '@/components/cart/CartEmpty';

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Shopping Cart | Senteur Fragrances";
    
    if (user) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      
      // Query the database directly for cart items
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user?.id);
        
      if (cartError) throw cartError;

      // If we have cart items, fetch the associated perfume details
      if (cartData && cartData.length > 0) {
        const perfumeIds = cartData.map(item => item.perfume_id);
        
        const { data: perfumesData, error: perfumesError } = await supabase
          .from('perfumes')
          .select('*')
          .in('id', perfumeIds);
          
        if (perfumesError) throw perfumesError;
        
        // Combine cart items with perfume details
        const items = cartData.map(cartItem => {
          const perfume = perfumesData.find(p => p.id === cartItem.perfume_id);
          return {
            ...cartItem,
            perfume
          } as CartItemType;
        });
        
        setCartItems(items);
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

  const checkout = async () => {
    try {
      // Create order
      const orderData = {
        user_id: user?.id,
        status: 'completed',
        total: calculateTotal()
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select();
        
      if (orderError || !orderResult || orderResult.length === 0) {
        throw orderError || new Error('Failed to create order');
      }
      
      const orderId = orderResult[0].id;
      
      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        perfume_id: item.perfume_id,
        quantity: item.quantity,
        price: item.perfume.price_value
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // Clear cart
      const { error: clearError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user?.id);
        
      if (clearError) throw clearError;
      
      setCartItems([]);
      toast.success('Order placed successfully!', {
        description: 'Your perfumes will be delivered soon.'
      });
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast.error('Failed to complete checkout', {
        description: error.message
      });
    }
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
          ) : !user || cartItems.length === 0 ? (
            <CartEmpty isAuthenticated={!!user} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart items */}
              <div className="flex-grow">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItem 
                      key={item.id} 
                      item={item} 
                      onItemUpdate={handleUpdateItem}
                      onItemRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
              
              {/* Order summary */}
              <div className="lg:w-1/3">
                <CartSummary 
                  cartItems={cartItems} 
                  onCheckout={checkout} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
