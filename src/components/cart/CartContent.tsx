
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CartItem, { CartItemType } from './CartItem';
import CartSummary from './CartSummary';
import CartEmpty from './CartEmpty';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { useCartCount } from '@/hooks/useCartCount';

interface CartContentProps {
  cartItems: CartItemType[];
  isLoading: boolean;
  onItemUpdate: (item: CartItemType) => void;
  onItemRemove: (id: string) => void;
}

const CartContent: React.FC<CartContentProps> = ({
  cartItems,
  isLoading,
  onItemUpdate,
  onItemRemove
}) => {
  const [userProfile, setUserProfile] = useState<{ address: string }>({ address: '' });
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const { user } = useAuth();
  const { refresh: refreshCartCount } = useCartCount(user?.id);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

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

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (user) {
      setShowCheckoutModal(true);
    } else {
      navigate('/auth', { 
        state: { 
          isCheckout: true, 
          cartItems: cartItems,
          from: '/cart' 
        } 
      });
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.perfume.price_value * item.quantity), 0);
    const shipping = 1;
    return subtotal + shipping;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-grow">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onItemUpdate={onItemUpdate}
                  onItemRemove={onItemRemove}
                  refreshCartCount={refreshCartCount}
                />
              ))}
            </div>
          ) : (
            <CartEmpty isAuthenticated={!!user} />
          )}
        </div>
        
        {/* Order summary - Show for all users when cart has items */}
        {cartItems.length > 0 && (
          <div className="lg:w-1/3">
            <CartSummary 
              cartItems={cartItems} 
              onCheckout={handleCheckoutClick}
              currencySymbol="AED "
            />
          </div>
        )}
      </div>
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={cartItems}
        total={calculateTotal()}
      />
    </>
  );
};

export default CartContent;
