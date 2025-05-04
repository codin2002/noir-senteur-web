
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Trash, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItem {
  id: string;
  user_id: string;
  perfume_id: string;
  quantity: number;
  created_at: string;
  perfume: {
    id: string;
    name: string;
    notes: string;
    description: string;
    image: string;
    price: string;
    price_value: number; // Actual numeric price for calculations
  };
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast: uiToast } = useToast();

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
      
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          perfume:perfumes(*)
        `)
        .eq('user_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      setCartItems(data || []);
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity', {
        description: error.message
      });
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setCartItems(cartItems.filter(item => item.id !== id));
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart', {
        description: error.message
      });
    }
  };

  const checkout = async () => {
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          status: 'completed',
          total: calculateTotal()
        })
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
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

  const extractNumericPrice = (priceString: string): number => {
    // Extract numeric value from price string (e.g. "$240" -> 240)
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
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
            <div className="text-center py-12">
              <h2 className="text-xl mb-4">Please sign in to view your cart</h2>
              <Button 
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-darker"
                onClick={() => window.location.href = '/auth'}
              >
                Sign In
              </Button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gold mb-4 opacity-50" />
              <h2 className="text-xl mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add items to your cart to proceed to checkout.</p>
              <Button 
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-darker"
                onClick={() => window.location.href = '/'}
              >
                Browse Collection
              </Button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart items */}
              <div className="flex-grow">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row bg-darker border border-gold/20 rounded-lg overflow-hidden">
                      <div className="sm:w-1/4 h-[140px] sm:h-auto">
                        <img 
                          src={item.perfume.image} 
                          alt={item.perfume.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm uppercase tracking-widest text-gold">{item.perfume.notes}</h3>
                          <h2 className="text-xl font-serif">{item.perfume.name}</h2>
                          <p className="text-lg font-light text-gold mt-2">{item.perfume.price}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 border-gold/50"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-lg w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 border-gold/50"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="outline"
                            size="icon"
                            className="border-red-500/50 hover:bg-red-500/10"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order summary */}
              <div className="lg:w-1/3 bg-darker border border-gold/20 rounded-lg p-6 h-fit">
                <h2 className="text-xl font-serif mb-6">Order Summary</h2>
                
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.perfume.name} × {item.quantity}</span>
                      <span>${extractNumericPrice(item.perfume.price) * item.quantity}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gold/20 pt-3 mt-3">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-gold">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gold text-darker hover:bg-gold/80 mt-6"
                  onClick={checkout}
                >
                  Checkout
                </Button>
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
