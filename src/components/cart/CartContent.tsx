
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
import { PRICING, OFFERS, getCartSubtotal, getSignatureDuoQuantity, isSignatureDuoCart } from '@/utils/constants';
import { ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const duoQuantity = getSignatureDuoQuantity(cartItems);
  const isSignatureDuo = duoQuantity > 0;
  const duoProductIds = new Set<string>(OFFERS.SIGNATURE_DUO.PRODUCT_IDS);
  const remainingItems = cartItems.flatMap((item) => {
    const reservedQuantity = duoProductIds.has(item.perfume.id) ? duoQuantity : 0;
    const displayQuantity = item.quantity - reservedQuantity;
    return displayQuantity > 0 ? [{ item, displayQuantity, reservedQuantity }] : [];
  });

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
          offerId: isSignatureDuoCart(cartItems) ? OFFERS.SIGNATURE_DUO.ID : undefined,
          from: '/cart' 
        } 
      });
    }
  };

  const calculateTotal = () => {
    const subtotal = getCartSubtotal(cartItems);
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Free shipping if 3 or more items, otherwise apply shipping cost
    const shippingCost = subtotal > 0 && totalQuantity < PRICING.FREE_SHIPPING_THRESHOLD ? PRICING.SHIPPING_COST : 0;
    return subtotal + shippingCost;
  };

  const removeSignatureDuo = async () => {
    try {
      const duoItems = cartItems.filter((item) => duoProductIds.has(item.perfume.id));
      for (const item of duoItems) {
        const remainingQuantity = item.quantity - duoQuantity;
        if (user) {
          const { error } = remainingQuantity > 0
            ? await supabase.from('cart').update({ quantity: remainingQuantity }).eq('id', item.id)
            : await supabase.from('cart').delete().eq('id', item.id);
          if (error) throw error;
        }
        if (remainingQuantity > 0) onItemUpdate({ ...item, quantity: remainingQuantity });
        else onItemRemove(item.id);
      }
      if (!user) {
        const duoIds = new Set(duoItems.map((item) => item.id));
        const updatedCart = cartItems.flatMap((item) => {
          if (!duoIds.has(item.id)) return [item];
          const remainingQuantity = item.quantity - duoQuantity;
          return remainingQuantity > 0 ? [{ ...item, quantity: remainingQuantity }] : [];
        });
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      }
      window.dispatchEvent(new Event('cartUpdated'));
      refreshCartCount();
      toast.success('Signature Duo removed from your cart');
    } catch (error: any) {
      toast.error('Could not remove the Signature Duo', { description: error.message });
    }
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
              {isSignatureDuo && (
                <div className="flex items-center gap-4 rounded-lg border border-gold/30 bg-darker p-4">
                  <img
                    src="/images/signature-duo-together.png"
                    alt="The Senteur Signature Duo"
                    className="h-24 w-24 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-gold" />
                      <h3 className="font-serif text-lg text-white">The Signature Duo</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">313 + 424 · 2 × 100 ml</p>
                    <p className="mt-2 text-lg font-medium text-gold">AED {(OFFERS.SIGNATURE_DUO.PRICE * duoQuantity).toFixed(2)}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-green-300"><ShieldCheck className="h-3.5 w-3.5" />You save AED {(OFFERS.SIGNATURE_DUO.SAVINGS * duoQuantity).toFixed(2)} on this order</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeSignatureDuo}
                    className="h-9 w-9 border-red-500/30 p-0 text-red-400 hover:bg-red-500/10"
                    aria-label="Remove Signature Duo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {remainingItems.map(({ item, displayQuantity, reservedQuantity }) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onItemUpdate={onItemUpdate}
                  onItemRemove={onItemRemove}
                  refreshCartCount={refreshCartCount}
                  displayQuantity={displayQuantity}
                  reservedQuantity={reservedQuantity}
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
