import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Perfume } from '@/types/perfume';
import ProductImage from '../common/ProductImage';

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
  refreshCartCount: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onItemUpdate, 
  onItemRemove,
  refreshCartCount
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const { user } = useAuth();

  // Get the appropriate image source
  const getPerfumeImage = () => {
    // For the "Signature First" perfume, use the custom image with Arabic "313"
    if (item.perfume.name === "Signature First") {
      return "/lovable-uploads/a9ced43b-497b-4733-9093-613c3f990036.png";
    }
    
    // For "Luxury Collection" perfume, use the uploaded image
    if (item.perfume.name === "Luxury Collection") {
      return "/lovable-uploads/8409f135-32ac-4937-ae90-9d2ad51131b5.png";
    }
    
    // Otherwise use the image from the database
    return item.perfume.image;
  };

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Update local state immediately for better UX
      setLocalQuantity(newQuantity);
      
      // Update the local state with the new quantity before database update
      onItemUpdate({
        ...item,
        quantity: newQuantity
      });
      
      // Refresh the cart count in navbar
      refreshCartCount();
      
      // Update the database in the background
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', item.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      // Revert local state if there's an error
      setLocalQuantity(item.quantity);
      onItemUpdate({
        ...item,
        quantity: item.quantity
      });
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
      
      // Optimistically remove from UI first
      onItemRemove(item.id);
      
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Item removed from cart');
      
      // Refresh the cart count in navbar
      refreshCartCount();
      
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
        <ProductImage 
          src={getPerfumeImage()} 
          alt={item.perfume.name} 
          className="w-full h-full"
          objectFit="contain"
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
          onClick={() => updateQuantity(localQuantity - 1)}
          disabled={isUpdating || localQuantity <= 1}
          className="p-1 rounded-full hover:bg-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="w-6 text-center">{localQuantity}</span>
        
        <button 
          onClick={() => updateQuantity(localQuantity + 1)}
          disabled={isUpdating || localQuantity >= 10}
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
