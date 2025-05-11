import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Perfume } from '@/types/perfume';

export interface CartItemType {
  id: string;
  user_id: string;
  perfume_id: string;
  quantity: number;
  created_at: string;
  perfume: Perfume;
}

interface CartItemProps {
  item: CartItemType;
  onItemUpdate: (item: CartItemType) => void;
  onItemRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onItemUpdate, onItemRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { user } = useAuth();

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', item.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update the local state with the new quantity
      onItemUpdate({
        ...item,
        quantity: newQuantity
      });
      
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update quantity', {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async () => {
    if (!user) return;
    
    try {
      setIsRemoving(true);
      
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      onItemRemove(item.id);
      toast.success('Item removed from cart');
      
    } catch (error: any) {
      console.error('Error removing cart item:', error);
      toast.error('Failed to remove item', {
        description: error.message
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-darker rounded-lg border border-gold/20">
      {/* Product image */}
      <div className="w-full sm:w-24 h-24 rounded-md overflow-hidden">
        <img 
          src={item.perfume.image} 
          alt={item.perfume.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Product details */}
      <div className="flex-grow">
        <h3 className="font-serif text-lg">{item.perfume.name}</h3>
        <p className="text-sm text-muted-foreground">{item.perfume.notes}</p>
        <p className="text-gold mt-1">
          {item.perfume.price.replace('$', 'AED ')}
        </p>
      </div>
      
      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateQuantity(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="p-1 rounded-full hover:bg-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="w-6 text-center">{item.quantity}</span>
        
        <button 
          onClick={() => updateQuantity(item.quantity + 1)}
          disabled={isUpdating || item.quantity >= 10}
          className="p-1 rounded-full hover:bg-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      {/* Remove button */}
      <div>
        <button 
          onClick={removeItem}
          disabled={isRemoving}
          className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
