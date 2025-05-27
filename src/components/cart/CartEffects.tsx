
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCartCount } from '@/hooks/useCartCount';
import { CartItemType } from './CartItem';

interface CartEffectsProps {
  cartItems: CartItemType[];
  setCartItems: (items: CartItemType[]) => void;
  loadCartFromLocalStorage: () => void;
  fetchCart: () => Promise<void>;
  searchParams: URLSearchParams;
}

const CartEffects: React.FC<CartEffectsProps> = ({
  cartItems,
  setCartItems,
  loadCartFromLocalStorage,
  fetchCart,
  searchParams
}) => {
  const { user } = useAuth();
  const { refresh: refreshCartCount } = useCartCount(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Shopping Cart | Senteur Fragrances";
    
    // Check for payment status in URL
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment completed successfully!', {
        description: 'Your order has been confirmed.'
      });
      setCartItems([]);
      localStorage.removeItem('cartItems');
      refreshCartCount();
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled', {
        description: 'Your cart items are still saved.'
      });
    }
    
    if (user) {
      fetchCart();
    } else {
      loadCartFromLocalStorage();
    }
  }, [user, searchParams]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('Cart update event received, refreshing cart...');
      if (user) {
        fetchCart();
      } else {
        loadCartFromLocalStorage();
      }
      refreshCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [user, refreshCartCount]);

  return null; // This component only handles effects
};

export default CartEffects;
