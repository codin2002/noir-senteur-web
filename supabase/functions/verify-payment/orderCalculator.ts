export interface OrderCalculation {
  subtotal: number;
  totalQuantity: number;
  shippingCost: number;
  totalAmount: number;
  orderItems: any[];
}

export async function calculateOrderTotal(orderCartItems: any[], supabaseService?: any): Promise<OrderCalculation> {
  console.log('=== STEP 4: CREATING ORDER ===');

  // SECURITY: fetch authoritative prices from DB, ignore any client-supplied price.
  let priceMap = new Map<string, number>();
  if (supabaseService) {
    const ids = Array.from(new Set(orderCartItems.map((it: any) => (it.perfume?.id ?? it.perfume_id)).filter(Boolean)));
    if (ids.length) {
      const { data, error } = await supabaseService
        .from('perfumes')
        .select('id, price_value')
        .in('id', ids);
      if (error) {
        console.error('Failed to load perfume prices:', error);
        throw new Error('Failed to load product pricing');
      }
      priceMap = new Map((data || []).map((p: any) => [p.id, Number(p.price_value)]));
    }
  }

  let subtotal = 0;
  let totalQuantity = 0;
  const orderItems = orderCartItems.map(item => {
    const perfume = item.perfume || item;
    const pid = perfume.id ?? item.perfume_id;
    const dbPrice = priceMap.get(pid);
    const price = dbPrice && dbPrice > 0 ? dbPrice : (perfume.price_value || 125);
    const quantity = item.quantity || 1;
    subtotal += price * quantity;
    totalQuantity += quantity;

    return {
      perfume_id: pid,
      quantity: quantity,
      price: price,
    };
  });

  const shippingCost = 0;
  const totalAmount = subtotal + shippingCost;

  console.log('Subtotal calculated:', subtotal);
  console.log('Total quantity:', totalQuantity);
  console.log('Final total amount:', totalAmount);

  return { subtotal, totalQuantity, shippingCost, totalAmount, orderItems };
}
