
import React from 'react';
import { Trash, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Perfume {
  id: string;
  name: string;
  notes: string;
  description: string;
  image: string;
  price: string;
  price_value: number;
}

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
  onItemUpdate: (updatedItem: CartItemType) => void;
  onItemRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onItemUpdate, onItemRemove }) => {
  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', item.id);
        
      if (error) {
        throw error;
      }
      
      onItemUpdate({ ...item, quantity: newQuantity });
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity', {
        description: error.message
      });
    }
  };

  const handleRemove = async () => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', item.id);
        
      if (error) {
        throw error;
      }
      
      onItemRemove(item.id);
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart', {
        description: error.message
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row bg-darker border border-gold/20 rounded-lg overflow-hidden">
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
              onClick={() => updateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-lg w-8 text-center">{item.quantity}</span>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 border-gold/50"
              onClick={() => updateQuantity(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button 
            variant="outline"
            size="icon"
            className="border-red-500/50 hover:bg-red-500/10"
            onClick={handleRemove}
          >
            <Trash className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
