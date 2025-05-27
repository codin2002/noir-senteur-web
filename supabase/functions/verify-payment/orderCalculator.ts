
export interface OrderCalculation {
  subtotal: number;
  totalQuantity: number;
  shippingCost: number;
  totalAmount: number;
  orderItems: any[];
}

export function calculateOrderTotal(orderCartItems: any[]): OrderCalculation {
  console.log('=== STEP 4: CREATING ORDER ===');

  let subtotal = 0;
  let totalQuantity = 0;
  const orderItems = orderCartItems.map(item => {
    const perfume = item.perfume || item;
    const price = perfume.price_value || 1;
    const quantity = item.quantity || 1;
    subtotal += price * quantity;
    totalQuantity += quantity;
    
    return {
      perfume_id: perfume.id,
      quantity: quantity,
      price: price
    };
  });

  // Apply correct shipping logic - free shipping if 2+ items, otherwise 1 AED
  const shippingCost = subtotal > 0 && totalQuantity < 2 ? 1 : 0;
  const totalAmount = subtotal + shippingCost;

  console.log('Subtotal calculated:', subtotal);
  console.log('Total quantity:', totalQuantity);
  console.log('Shipping cost applied:', shippingCost);
  console.log('Final total amount:', totalAmount);
  console.log('Order items count:', orderItems.length);

  return {
    subtotal,
    totalQuantity,
    shippingCost,
    totalAmount,
    orderItems
  };
}
