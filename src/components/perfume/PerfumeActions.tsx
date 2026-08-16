
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useCartCount } from '@/hooks/useCartCount';
import { usePreorderInfo } from '@/hooks/usePreorderInfo';
import PreorderBadge from './PreorderBadge';
import { fbqAddToCart } from '@/utils/metaPixel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPerfumeDisplayName, OFFERS, PERFUMES } from '@/utils/constants';

interface Perfume {
  id: string;
  name: string;
  description: string;
  price: string;
  price_value: number;
  image: string;
  notes: string;
}

interface PerfumeActionsProps {
  perfume: Perfume;
  perfumeId: string;
}

const PerfumeActions: React.FC<PerfumeActionsProps> = ({ 
  perfume, 
  perfumeId
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [showCartConfirmation, setShowCartConfirmation] = useState(false);
  const [confirmedQuantity, setConfirmedQuantity] = useState(1);
  const [cartSubtotal, setCartSubtotal] = useState(perfume.price_value);
  const { refresh: refreshCartCount } = useCartCount(user?.id);
  const { info: preorderInfo, isActive: isPreorder } = usePreorderInfo(perfumeId);
  const duoPartner = perfumeId === PERFUMES.THREE_ONE_THREE.ID
    ? PERFUMES.FOUR_TWO_FOUR
    : perfumeId === PERFUMES.FOUR_TWO_FOUR.ID
      ? PERFUMES.THREE_ONE_THREE
      : null;

  const buyNow = () => {
    setStartingCheckout(true);
    const checkoutItem = {
      id: `checkout-${perfumeId}`,
      quantity: 1,
      perfume: {
        id: perfume.id,
        name: perfume.name,
        price: perfume.price,
        price_value: perfume.price_value,
        image: perfume.image,
        notes: perfume.notes,
      },
    };
    navigate('/auth', {
      state: { isCheckout: true, cartItems: [checkoutItem], preserveCart: true, from: `/perfume/${perfumeId}` },
    });
  };

  const addToCart = async () => {
    if (!perfumeId || !perfume) return;

    setAddingToCart(true);
    try {
      if (user) {
        // For authenticated users, check for existing item and update quantity
        const { data: existingItem, error: checkError } = await supabase
          .from('cart')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('perfume_id', perfumeId)
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
          setConfirmedQuantity(existingItem.quantity + 1);
        } else {
          // Add new item
          const { error: insertError } = await supabase
            .from('cart')
            .insert([{ user_id: user.id, perfume_id: perfumeId, quantity: 1 }]);

          if (insertError) throw insertError;
          setConfirmedQuantity(1);
        }
        
        refreshCartCount();
      } else {
        // For non-authenticated users, use localStorage with proper duplicate handling
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const existingItemIndex = cartItems.findIndex((item: any) => item.perfume.id === perfumeId);
        
        if (existingItemIndex > -1) {
          // Update quantity of existing item
          cartItems[existingItemIndex].quantity += 1;
          setConfirmedQuantity(cartItems[existingItemIndex].quantity);
        } else {
          // Add new item with proper structure
          const newItem = {
            id: `temp-${Date.now()}-${perfumeId}`,
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
          setConfirmedQuantity(1);
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        refreshCartCount();
      }

      fbqAddToCart({ id: perfume.id, name: perfume.name, price: perfume.price_value, quantity: 1 });

      let summaryItems: any[] = [];
      if (user) {
        const { data: serverCart, error: cartError } = await supabase.rpc('get_cart_with_perfumes', { user_uuid: user.id });
        if (cartError) console.warn('Unable to refresh cart summary', cartError);
        summaryItems = serverCart || [];
      } else {
        summaryItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      }
      const summary = summaryItems.reduce((totals, item) => {
        const product = item.perfume || {};
        const quantity = Number(item.quantity) || 0;
        return {
          count: totals.count + quantity,
          subtotal: totals.subtotal + quantity * Number(product.price_value || 0),
        };
      }, { count: 0, subtotal: 0 });
      setCartSubtotal(summary.subtotal || perfume.price_value * confirmedQuantity);
      setShowCartConfirmation(true);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        description: error.message
      });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <>
    <div className="space-y-4">
      {isPreorder && preorderInfo && <PreorderBadge info={preorderInfo} />}
      {!isPreorder && (
        <Button
          onClick={buyNow}
          disabled={addingToCart || startingCheckout}
          className="w-full bg-gold text-darker hover:bg-gold/80 text-lg py-6"
        >
          {startingCheckout ? 'Opening checkout...' : `Buy now AED ${perfume.price_value.toFixed(2)}`}
        </Button>
      )}
      <Button
        onClick={addToCart}
        disabled={addingToCart}
        variant="outline"
        className="w-full border-gold/50 text-gold hover:bg-gold/10 text-lg py-6"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        {addingToCart ? 'Adding...' : isPreorder ? 'Preorder Now' : 'Add to Cart'}
      </Button>

      {duoPartner && (
        <div className="rounded-md border border-gold/25 bg-gold/[0.03] px-4 py-3">
          <p className="text-sm font-medium text-gold">Complete the Duo</p>
          <p className="mt-1 text-xs text-white/60">
            Add {duoPartner.DISPLAY_NAME} (100 ml) for AED 90 more
          </p>
          <p className="mt-1 text-xs text-white/60">
            Both for AED {OFFERS.SIGNATURE_DUO.PRICE} <span className="text-gold/80">· Save AED {OFFERS.SIGNATURE_DUO.SAVINGS}</span>
          </p>
          <Button
            variant="link"
            className="mt-1 h-auto p-0 text-sm text-gold hover:text-gold/80"
            onClick={() => navigate('/offers/signature-duo')}
          >
            Buy both
          </Button>
        </div>
      )}
    </div>
    <Dialog open={showCartConfirmation} onOpenChange={setShowCartConfirmation}>
      <DialogContent className="max-w-md bg-darker border-gold/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-2xl text-gold">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            Added to your cart
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 rounded-lg border border-gold/15 bg-dark/60 p-3">
          <img
            src={perfume.image}
            alt={getPerfumeDisplayName(perfume)}
            className="h-16 w-16 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{getPerfumeDisplayName(perfume)}</p>
            <p className="text-sm text-muted-foreground">Qty {confirmedQuantity}</p>
            <p className="mt-1 text-sm text-gold">AED {perfume.price_value.toFixed(2)} each</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-y border-gold/15 py-3">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-semibold text-white">AED {cartSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-200">
          <ShieldCheck className="h-4 w-4" />
          Free UAE delivery and secure payment
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="border-gold/50 text-gold hover:bg-gold/10"
            onClick={() => {
              setShowCartConfirmation(false);
              navigate('/#collection');
            }}
          >
            Continue Shopping
          </Button>
          <Button
            className="bg-gold text-darker hover:bg-gold/80"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default PerfumeActions;
