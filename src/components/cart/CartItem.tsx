
import React, { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

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
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onItemUpdate, 
  onItemRemove, 
  refreshCartCount 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  const updateLocalStorage = (updatedItems: CartItemType[]) => {
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    
    try {
      if (user) {
        // Update in database for authenticated users
        const { error } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', item.id);
        
        if (error) throw error;
      }
      
      // Update local state and localStorage
      const updatedItem = { ...item, quantity: newQuantity };
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
      if (user) {
        // Remove from database for authenticated users
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', item.id);
        
        if (error) throw error;
      }
      
      // Update local state and localStorage
      onItemRemove(item.id);
      
      // Update localStorage
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCart = cartItems.filter((cartItem: CartItemType) => cartItem.id !== item.id);
      updateLocalStorage(updatedCart);
      
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
        <h3 className="font-semibold">{item.perfume.name}</h3>
        <p className="text-sm text-muted-foreground">{item.perfume.notes}</p>
        <p className="font-medium mt-1">{item.perfume.price}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateQuantity(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="h-8 w-8 p-0 border-gold/30"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="w-8 text-center">{item.quantity}</span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateQuantity(item.quantity + 1)}
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
