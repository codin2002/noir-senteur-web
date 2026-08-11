
import React, { useState } from 'react';
import { Minus, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usePreorderInfo } from '@/hooks/usePreorderInfo';

export interface CartItemType {
  id: string;
  quantity: number;
  perfume: {
    id: string;
    name: string;
    price: string;
    price_value: number;
    image: string;
    notes: string;
  };
}

interface CartItemProps {
  item: CartItemType;
  onItemUpdate: (item: CartItemType) => void;
  onItemRemove: (id: string) => void;
  refreshCartCount: () => void;
  displayQuantity?: number;
  reservedQuantity?: number;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onItemUpdate, 
  onItemRemove, 
  refreshCartCount,
  displayQuantity,
  reservedQuantity = 0,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { info: preorderInfo, isActive: isPreorder } = usePreorderInfo(item.perfume.id);

  const updateLocalStorage = (updatedItems: CartItemType[]) => {
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const visibleQuantity = displayQuantity ?? item.quantity;

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    const actualQuantity = newQuantity + reservedQuantity;
    
    setIsUpdating(true);
    
    try {
      if (user) {
        // Update in database for authenticated users
        const { error } = await supabase
          .from('cart')
          .update({ quantity: actualQuantity })
          .eq('id', item.id);
        
        if (error) throw error;
      }
      
      // Update local state and localStorage
      const updatedItem = { ...item, quantity: actualQuantity };
      onItemUpdate(updatedItem);
      
      // Update localStorage for persistence
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCart = cartItems.map((cartItem: CartItemType) => 
        cartItem.id === item.id ? updatedItem : cartItem
      );
      updateLocalStorage(updatedCart);
      
      refreshCartCount();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    
    try {
      if (reservedQuantity > 0) {
        if (user) {
          const { error } = await supabase
            .from('cart')
            .update({ quantity: reservedQuantity })
            .eq('id', item.id);
          if (error) throw error;
        }
        const updatedItem = { ...item, quantity: reservedQuantity };
        onItemUpdate(updatedItem);
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        updateLocalStorage(cartItems.map((cartItem: CartItemType) => cartItem.id === item.id ? updatedItem : cartItem));
      } else if (user) {
        // Remove from database for authenticated users
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', item.id);
        
        if (error) throw error;
      }
      
      if (reservedQuantity === 0) {
        // Update local state and localStorage
        onItemRemove(item.id);
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const updatedCart = cartItems.filter((cartItem: CartItemType) => cartItem.id !== item.id);
        updateLocalStorage(updatedCart);
      }
      
      refreshCartCount();
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-darker border border-gold/20 rounded-lg">
      <img 
        src={item.perfume.image} 
        alt={item.perfume.name}
        className="w-20 h-20 object-cover rounded"
      />
      
      <div className="flex-grow">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold">{item.perfume.name}</h3>
          {isPreorder && (
            <span className="inline-flex items-center gap-1 bg-gold/20 text-gold border border-gold/40 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" /> Preorder
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{item.perfume.notes}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/45">100 ml</p>
        <p className="font-medium mt-1">{item.perfume.price}</p>
        {isPreorder && preorderInfo?.expected_shipping_date && (
          <p className="text-xs text-gold mt-1">
            Estimated delivery: {new Date(preorderInfo.expected_shipping_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateQuantity(visibleQuantity - 1)}
          disabled={isUpdating || visibleQuantity <= 1}
          className="h-8 w-8 p-0 border-gold/30"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="w-8 text-center">{visibleQuantity}</span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateQuantity(visibleQuantity + 1)}
          disabled={isUpdating}
          className="h-8 w-8 p-0 border-gold/30"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRemove}
        disabled={isUpdating}
        className="h-8 w-8 p-0 border-red-500/30 text-red-400 hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CartItem;
