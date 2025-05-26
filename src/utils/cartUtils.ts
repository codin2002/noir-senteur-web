
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
