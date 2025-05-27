import { CartItemType } from '@/components/cart/CartItem';

export const mergeCartItems = (cartItems: CartItemType[]): CartItemType[] => {
  const mergedItems: { [key: string]: CartItemType } = {};
  
  cartItems.forEach(item => {
    const perfumeId = item.perfume.id;
    
    if (mergedItems[perfumeId]) {
      // Merge quantities for duplicate items
      mergedItems[perfumeId].quantity += item.quantity;
    } else {
      // Add new item
      mergedItems[perfumeId] = { ...item };
    }
  });
  
  return Object.values(mergedItems);
};

export const cleanupCartStorage = () => {
  try {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const cleanedItems = mergeCartItems(cartItems);
    localStorage.setItem('cartItems', JSON.stringify(cleanedItems));
    return cleanedItems;
  } catch (error) {
    console.error('Error cleaning up cart storage:', error);
    return [];
  }
};

// New function to remove duplicate cart items from database
export const removeDuplicateCartItems = async (supabase: any, userId: string, cartItems: CartItemType[]) => {
  try {
    // Group items by perfume_id to identify duplicates
    const itemsByPerfume: { [key: string]: CartItemType[] } = {};
    
    cartItems.forEach(item => {
      const perfumeId = item.perfume.id;
      if (!itemsByPerfume[perfumeId]) {
        itemsByPerfume[perfumeId] = [];
      }
      itemsByPerfume[perfumeId].push(item);
    });
    
    // Process each perfume group
    for (const [perfumeId, items] of Object.entries(itemsByPerfume)) {
      if (items.length > 1) {
        console.log(`Found ${items.length} duplicate items for perfume ${perfumeId}, cleaning up...`);
        
        // Calculate total quantity
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Keep the first item and delete the rest
        const itemToKeep = items[0];
        const itemsToDelete = items.slice(1);
        
        // Delete duplicate items
        for (const item of itemsToDelete) {
          await supabase
            .from('cart')
            .delete()
            .eq('id', item.id);
        }
        
        // Update the remaining item with the total quantity
        await supabase
          .from('cart')
          .update({ quantity: totalQuantity })
          .eq('id', itemToKeep.id);
      }
    }
    
    console.log('Duplicate cart items cleanup completed');
  } catch (error) {
    console.error('Error removing duplicate cart items:', error);
  }
};
